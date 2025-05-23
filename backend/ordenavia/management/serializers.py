from rest_framework import serializers
from management.models import Restaurant, Schedule, RestaurantCategory, RestaurantProduct



class ScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = [
            'id', 'day_of_week', 'day_name', 'opening_time', 'closing_time',
            'is_closed', 'shift_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'day_name']

    def get_day_name(self, obj):
        return obj.get_day_of_week_display()


class RestaurantSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'description', 'legal_name', 'commercial_name',
            'tax_id', 'fiscal_address', 'address', 'city', 'state', 'country',
            'phone', 'email', 'google_maps_embed_url', 'status',
            'created_at', 'updated_at', 'schedules', 'image',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class RestaurantProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantProduct
        fields = [
            'id', 'name', 'description', 'price', 'image',
            'is_available', 'is_featured', 'is_recommended', 'is_new',
            'category', 'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
    def get_category(self, obj):
        return obj.category.name


class RestaurantCategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantCategory
        fields = [
            'id', 'name', 'description', 'image',
            'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None