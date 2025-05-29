from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import Account, Permission, Role, Profile
from management.serializers import RestaurantSerializer



class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    birth_date = serializers.DateField(required=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    gender = serializers.ChoiceField(choices=Account.GENDER_CHOICES, required=True)

    email_verified = serializers.BooleanField(default=False, required=False)
    phone_verified = serializers.BooleanField(default=False, required=False)
    language = serializers.CharField(default='es', required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True, required=False)
    is_staff = serializers.BooleanField(default=False, required=False)
    is_superuser = serializers.BooleanField(default=False, required=False)
    last_login = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True, default=None)
    updated_at = serializers.DateTimeField(read_only=True, default=None)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya existe.")
        
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("El correo electrónico ya existe.")
        
        return value


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        exclude = ['user']


class UserSerializer(serializers.ModelSerializer):
    account = AccountSerializer()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'last_login',
            'account',
        ]


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = [
            'id',
            'code',
            'name',
            'description',
            'assignable',
        ]


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True)
    inherited_roles = serializers.StringRelatedField(many=True)

    class Meta:
        model = Role
        fields = [
            'id',
            'name',
            'description',
            'level',
            'permissions',
            'inherited_roles',
        ]


class ProfileSerializer(serializers.ModelSerializer):
    account = AccountSerializer()
    restaurant = RestaurantSerializer()
    roles = RoleSerializer(many=True)
    custom_permissions = PermissionSerializer(many=True)

    class Meta:
        model = Profile
        fields = [
            'id',
            'account',
            'restaurant',
            'roles',
            'custom_permissions',
            'is_active',
            'created_at',
            'updated_at',
        ]