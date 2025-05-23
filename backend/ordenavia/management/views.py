import json
import subprocess

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from authentication.permissions import IsAuthenticatedAndHasAccount
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from authentication.models import Profile, Role
from authentication.serializers import ProfileSerializer

from management.models import Restaurant, Schedule, RestaurantCategory, RestaurantProduct
from management.serializers import RestaurantCategorySerializer, RestaurantProductSerializer, RestaurantSerializer



class ManagementViewSet(viewsets.ViewSet):
    METHOD_PERMISSIONS = {
        'create_restaurant': ['MANAGEMENT_RESTAURANT_CREATE'],
        'update_restaurant': ['MANAGEMENT_RESTAURANT_UPDATE'],
        'delete_restaurant': ['MANAGEMENT_RESTAURANT_DELETE'],
    }

    def get_permissions(self):
        if self.action not in ManagementViewSet.METHOD_PERMISSIONS.keys():
            return [AllowAny()]
        
        return [IsAuthenticatedAndHasAccount()]


    @action(detail=False, methods=['post'])
    def create_restaurant(self, request):
        try:
            restaurant_data = json.loads(request.data.get('restaurant'))
            schedules_data = json.loads(request.data.get('schedules'))
        except (json.JSONDecodeError, TypeError) as e:
            return Response({
                'data': None,
                'errors': [{'field': 'request', 'message': 'Formato inválido en restaurant o schedules.'}],
                'status': 'INVALID_JSON',
            }, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES.get('image')

        serializer = RestaurantSerializer(data=restaurant_data)
        if not serializer.is_valid():
            return Response({
                'data': None,
                'errors': serializer.errors,
                'status': 'MANAGEMENT_RESTAURANT_DATA_INVALID',
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        restaurant = Restaurant.objects.create(
            name=data['name'],
            description=data.get('description'),
            legal_name=data.get('legal_name'),
            commercial_name=data.get('commercial_name'),
            tax_id=data.get('tax_id'),
            fiscal_address=data.get('fiscal_address'),
            address=data['address'],
            city=data['city'],
            state=data['state'],
            country=data['country'],
            phone=data['phone'],
            email=data['email'],
            google_maps_embed_url=data['google_maps_embed_url'],
            status=data.get('status', 'inactive'),
            image=image,
        )

        if schedules_data:
            for schedule_data in schedules_data:
                schedule = Schedule.objects.create(
                    restaurant=restaurant,
                    day_of_week=schedule_data['day'],
                    opening_time=schedule_data['open_time'],
                    closing_time=schedule_data['close_time'],
                    is_closed=schedule_data.get('is_closed', False),
                    shift_name=schedule_data.get('shift_name', None),
                )
                restaurant.schedules.add(schedule)

        manager_profile = Profile.objects.create(
            account=request.user.account,
            restaurant=restaurant,
            is_active=True,
        )

        try:
            manager_role = Role.objects.get(name='manager')
            manager_profile.roles.add(manager_role)
        except Role.DoesNotExist:
            return Response({
                'data': None,
                'errors': [
                    {
                        'field': 'role',
                        'message': 'Rol "manager" no existe. Contacta con soporte.'
                    }
                ],
                'status': 'AUTH_ROLE_NOT_FOUND',
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'data': {
                'profile': ProfileSerializer(manager_profile).data,
            },
            'errors': None,
            'status': 'MANAGEMENT_RESTAURANT_CREATE_SUCCESS',
        }, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['put'])
    def update_restaurant(self, request, pk=None):
        restaurant = Restaurant.objects.filter(pk=pk).first()
        if not restaurant:
            return Response({
                'data': None,
                'errors': [{'field': 'restaurant', 'message': 'Restaurante no encontrado.'}],
                'status': 'MANAGEMENT_RESTAURANT_NOT_FOUND',
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            restaurant_data = json.loads(request.data.get('restaurant'))
            schedules_data = json.loads(request.data.get('schedules'))
            categories_data = json.loads(request.data.get('categories'))
            products_data = json.loads(request.data.get('products'))
        except (json.JSONDecodeError, TypeError) as e:
            return Response({
                'data': None,
                'errors': [{'field': 'request', 'message': 'Formato inválido en el request.'}],
                'status': 'INVALID_JSON',
            }, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES.get('image')

        serializer = RestaurantSerializer(data=restaurant_data)
        if not serializer.is_valid():
            return Response({
                'data': None,
                'errors': serializer.errors,
                'status': 'MANAGEMENT_RESTAURANT_DATA_INVALID',
            }, status=status.HTTP_400_BAD_REQUEST)

        restaurant.name = restaurant_data['name']
        restaurant.description = restaurant_data.get('description')
        restaurant.legal_name = restaurant_data.get('legal_name')
        restaurant.commercial_name = restaurant_data.get('commercial_name')
        restaurant.tax_id = restaurant_data.get('tax_id')
        restaurant.fiscal_address = restaurant_data.get('fiscal_address')
        restaurant.address = restaurant_data['address']
        restaurant.city = restaurant_data['city']
        restaurant.state = restaurant_data['state']
        restaurant.country = restaurant_data['country']
        restaurant.phone = restaurant_data['phone']
        restaurant.email = restaurant_data['email']
        restaurant.google_maps_embed_url = restaurant_data['google_maps_embed_url']
        restaurant.status = restaurant_data.get('status', 'inactive')
        if image:
            restaurant.image = image

        request_schedule_ids = []

        if schedules_data:
            for schedule_data in schedules_data:
                schedule_id = schedule_data.get('id')
                schedule = restaurant.schedules.filter(id=schedule_id).first() if schedule_id else None
        
                if schedule:
                    schedule.day_of_week = schedule_data.get('day', schedule.day_of_week)
                    schedule.shift_name = schedule_data.get('shift_name', schedule.shift_name)
                    schedule.opening_time = schedule_data.get('open_time', schedule.opening_time)
                    schedule.closing_time = schedule_data.get('close_time', schedule.closing_time)
                    schedule.is_closed = schedule_data.get('is_closed', schedule.is_closed)
                    schedule.save()
                else:
                    schedule = Schedule.objects.create(
                        restaurant=restaurant,
                        day_of_week=schedule_data['day'],
                        shift_name=schedule_data.get('shift_name', None),
                        opening_time=schedule_data['open_time'],
                        closing_time=schedule_data['close_time'],
                        is_closed=schedule_data.get('is_closed', False),
                    )

                    restaurant.schedules.add(schedule)

                request_schedule_ids.append(schedule.id)

        request_category_ids = []

        if categories_data:
            for category_data in categories_data:
                name = category_data['name'].strip()
                image = request.FILES.get(category_data['images_id']) if category_data.get('images_id') else None
                category = restaurant.categories.filter(name=name).first()
        
                if category:
                    category.description = category_data.get('description', category.description)
                    category.image = image if image else category.image
                    
                    category.save()
                else:
                    category = RestaurantCategory.objects.create(
                        restaurant=restaurant,
                        name=name,
                        description=category_data.get('description'),
                        image=image if image else None,
                    )

                request_category_ids.append(category.id)

        request_product_ids = []

        if products_data:
            for product_data in products_data:
                product = restaurant.products.filter(pk=product_data.get('id')).first()
                image = request.FILES.get(product_data['images_id']) if product_data.get('images_id') else None

                category = None
                if product_data.get('category'):
                    category = restaurant.categories.filter(name=product_data['category']).first()

                if product:
                    product.name = product_data.get('name', product.name)
                    product.description = product_data.get('description', product.description)
                    product.price = product_data.get('price', product.price)
                    product.category = category if category else product.category
                    product.is_available = product_data.get('is_available', product.is_available)
                    product.is_featured = product_data.get('is_featured', product.is_featured)
                    product.is_recommended = product_data.get('is_recommended', product.is_recommended)
                    product.is_new = product_data.get('is_new', product.is_new)
                    if image:
                        product.image = image
                    
                    product.save()
                else:
                    product = RestaurantProduct.objects.create(
                        restaurant=restaurant,
                        name=product_data.get('name'),
                        description=product_data.get('description'),
                        price=product_data['price'],
                        category=category,
                        is_available=product_data.get('is_available', True),
                        is_featured=product_data.get('is_featured', False),
                        is_recommended=product_data.get('is_recommended', False),
                        is_new=product_data.get('is_new', False),
                        image=image if image else None,
                    )

                    restaurant.products.add(product)
                
                request_product_ids.append(product.id)

        # Borramos los horarios, categorías, productos que no están en la request
        # ya que se determina que han decidido borrarlos.
        restaurant.schedules.exclude(id__in=request_schedule_ids).delete()
        restaurant.categories.exclude(id__in=request_category_ids).delete()
        restaurant.products.exclude(id__in=request_product_ids).delete()

        restaurant.save()

        return Response({
            'data': None,
            'errors': None,
            'status': 'MANAGEMENT_RESTAURANT_UPDATE_SUCCESS',
        }, status=status.HTTP_200_OK)


    @action(detail=True, methods=['delete'])
    def delete_restaurant(self, request, pk=None):
        restaurant = Restaurant.objects.filter(pk=pk).first()
        if not restaurant:
            return Response({
                'data': None,
                'errors': [{'field': 'restaurant', 'message': 'Restaurante no encontrado.'}],
                'status': 'MANAGEMENT_RESTAURANT_NOT_FOUND',
            }, status=status.HTTP_404_NOT_FOUND)
        
        restaurant.delete()

        return Response({
            'data': None,
            'errors': None,
            'status': 'MANAGEMENT_RESTAURANT_DELETE_SUCCESS',
        }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'])
    def get_restaurants(self, request):
        restaurants = Restaurant.objects.all()
        serializer = RestaurantSerializer(restaurants, many=True)
        
        return Response({
            'data': {
                'restaurants': serializer.data,
            },
            'errors': None,
            'status': 'MANAGEMENT_RESTAURANT_LIST_SUCCESS',
        }, status=status.HTTP_200_OK)
    

    @action(detail=True, methods=['get'])
    def get_restaurant(self, request, pk=None):
        restaurant = Restaurant.objects.filter(pk=pk).first()
        if not restaurant:
            return Response({
                'data': None,
                'errors': [{'field': 'restaurant', 'message': 'Restaurante no encontrado.'}],
                'status': 'MANAGEMENT_RESTAURANT_NOT_FOUND',
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'data': {
                'restaurant': RestaurantSerializer(restaurant).data,
                'categories': RestaurantCategorySerializer(restaurant.categories.all(), many=True).data,
                'products': RestaurantProductSerializer(restaurant.products.all(), many=True).data,
            },
            'errors': None,
            'status': 'MANAGEMENT_RESTAURANT_DETAIL_SUCCESS',
        }, status=status.HTTP_200_OK)
