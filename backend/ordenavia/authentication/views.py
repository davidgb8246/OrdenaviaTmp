from datetime import datetime, timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from authentication.models import Account
from authentication.serializers import RegisterSerializer, UserSerializer

from ordenavia.settings import SIMPLE_JWT



class AuthViewSet(viewsets.ViewSet):
    def get_permissions(self):
        print(self.request.user)
        
        if self.action in ['register', 'login', 'refresh', 'logout']:
            return [AllowAny()]
        
        return [IsAuthenticated()]
    

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'data': None,
                'errors': serializer.errors,
                'status': 'AUTH_REGISTER_DATA_INVALID',
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            is_active=data.get('is_active', True),
            is_staff=data.get('is_staff', False),
            is_superuser=data.get('is_superuser', False)
        )

        Account.objects.create(
            user=user,
            birth_date=data['birth_date'],
            phone=data['phone'],
            gender=data['gender'],
            language=data.get('language', 'es'),
            email_verified=False,
            phone_verified=False
        )

        return Response(
            {
                'data': None,
                'errors': None,
                'status': 'AUTH_REGISTER_SUCCESS',
            },
            status=status.HTTP_201_CREATED
        )
    
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            state = {
                'data': None,
                'errors': [],
                'status': "AUTH_CREDENTIALS_REQUIRED",
            }

            for k, v in [ { 'email': email }, { 'password': password } ]:
                if not v:
                    state['errors'].append({
                        'field': k,
                        'message': f'{k} es un campo requerido.',
                    })

            return Response(
                state, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Obtener el usuario mediante su email
            user = User.objects.get(email=email)
            account = Account.objects.get(user=user)

            # Autenticación
            user = authenticate(request, username=user.username, password=password)
            if not user:
                return Response(
                    {
                        'data': None,
                        'errors': [
                            {
                                'field': 'password',
                                'message': 'La contraseña es incorrecta.',
                            }
                        ],
                        'status': "AUTH_CREDENTIALS_INVALID",
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar si el usuario está activo
            if not user.is_active:
                return Response(
                    {
                        'data': None,
                        'errors': [
                            {
                                'field': 'user',
                                'message': 'El usuario no está activo.',
                            }
                        ],
                        'status': "AUTH_USER_INACTIVE",
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar si el usuario tiene una cuenta
            if not account:
                return Response(
                    {
                        'data': None,
                        'errors': [
                            {
                                'field': 'user',
                                'message': 'El usuario no tiene una cuenta. Por favor, contacte con un administrador.',
                            }
                        ],
                        'status': "AUTH_USER_NO_ACCOUNT",
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            refresh = RefreshToken.for_user(user)
            refresh_cookie_name = SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')

            if refresh_cookie_name in request.COOKIES:
                previous_refresh_token = request.COOKIES.get(refresh_cookie_name)

                try:
                    old_refresh_token = RefreshToken(previous_refresh_token)
                    old_refresh_token.blacklist()
                except Exception:
                    pass  # Si no existe un refresh token válido, se ignora

            response = Response({
                    'data': {
                        'user': UserSerializer(user).data,
                        'access_token': str(refresh.access_token),
                    },
                    'errors': None,
                    'status': "AUTH_LOGIN_SUCCESS",
                },
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key=refresh_cookie_name, 
                value=str(refresh),
                expires=datetime.now(timezone.utc) + SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                httponly=SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                samesite=SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
            )

            user.last_login = refresh.current_time
            user.save()

            return response

        except User.DoesNotExist:
            return Response({
                'data': None,
                'errors': [
                    {
                        'field': 'user',
                        'message': 'El usuario no existe.'
                    }
                ],
                'status': "AUTH_USER_NOT_FOUND",
            }, status=status.HTTP_404_NOT_FOUND)
        
        except Account.DoesNotExist:
            return Response({
                'data': None,
                'errors': [
                    {
                        'field': 'account',
                        'message': 'La cuenta asociada al usuario no se encuentra. Por favor, contacte con un administrador.'
                    }
                ],
                'status': "AUTH_USER_NO_ACCOUNT",
            }, status=status.HTTP_404_NOT_FOUND)
        

    @action(detail=False, methods=['post'])
    def get_profiles(self, request):
        user = request.user
        account = getattr(user, 'account', None)

        if not account:
            return Response({
                'data': None,
                'errors': [
                    {
                        'field': 'user',
                        'message': 'El usuario no tiene una cuenta asociada.'
                    }
                ],
                'status': "AUTH_USER_NO_ACCOUNT",
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener los perfiles activos del usuario

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        refresh_cookie_name = SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name)

        if not refresh_token:
            return Response({
                'data': None,
                'errors': [
                    {
                        'field': refresh_cookie_name,
                        'message': 'El token de refresco no se encuentra.'
                    }
                ],
                'status': "AUTH_REFRESH_TOKEN_NOT_FOUND",
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)

            new_access_token = serializer.validated_data['access']
            new_refresh_token = serializer.validated_data['refresh']

            response = Response({
                'data': {
                    'access_token': str(new_access_token),
                    'user': UserSerializer(User.objects.get(id=RefreshToken(new_refresh_token).get('user_id'))).data,
                },
                'errors': None,
                'status': "AUTH_REFRESH_SUCCESS",
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key=refresh_cookie_name,
                value=str(new_refresh_token),
                expires=datetime.now(timezone.utc) + SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                httponly=SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                samesite=SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
            )

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError as e:
                pass # Si no existe un refresh token válido, se ignora

            return response

        except Exception as e:
            response = Response({
                'data': None,
                'errors': [
                    {
                        'field': refresh_cookie_name,
                        'message': 'El token de refresco es inválido.'
                    }
                ],
                'status': "AUTH_REFRESH_TOKEN_INVALID",
            }, status=status.HTTP_400_BAD_REQUEST)

            response.delete_cookie(refresh_cookie_name)

            return response


    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.COOKIES.get(SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'))
            if not refresh_token:
                return Response({
                    'data': None,
                    'errors': [
                        {
                            'field': SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'),
                            'message': 'El token de refresco no se encuentra.'
                        }
                    ],
                    'status': "AUTH_REFRESH_TOKEN_NOT_FOUND",
                }, status=status.HTTP_404_NOT_FOUND)

            # Blacklist el token de refresco
            token = RefreshToken(refresh_token)
            if not OutstandingToken.objects.filter(token=str(token)).exists():
                raise TokenError("Token de refresco no reconocido o no emitido por el sistema.")
            
            token.blacklist()

            # Eliminar la cookie del refresh token
            response = Response({
                'data': None,
                'errors': None,
                'status': "AUTH_LOGOUT_SUCCESS",
            }, status=status.HTTP_200_OK)
            response.delete_cookie(SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'))

            return response

        except Exception:
            response = Response({
                'data': None,
                'errors': [
                    {
                        'field': SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'),
                        'message': 'El token de refresco es inválido.'
                    }
                ],
                'status': "AUTH_REFRESH_TOKEN_INVALID",
            }, status=status.HTTP_400_BAD_REQUEST)
        
            response.delete_cookie(SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'))
            return response
