from django.contrib import admin
from django.utils.html import format_html
from .models import Restaurant, RestaurantCategory, RestaurantProduct, Schedule


class ScheduleInline(admin.TabularInline):
    model = Schedule
    extra = 0


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'day_of_week', 'shift_name', 'opening_time', 'closing_time', 'is_closed')
    list_filter = ('day_of_week', 'is_closed')
    search_fields = ('restaurant__name', 'shift_name')
    readonly_fields = ('created_at', 'updated_at')


class RestaurantCategoryInline(admin.TabularInline):
    model = RestaurantCategory
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    fields = ('name', 'description', 'image', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'


class RestaurantProductInline(admin.TabularInline):
    model = RestaurantProduct
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    fields = (
        'name', 'description', 'price', 'category',
        'is_available', 'is_featured', 'is_recommended', 'is_new',
        'image', 'image_preview'
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'city', 'country', 'email', 'phone', 'created_at')
    list_filter = ('status', 'city', 'country')
    search_fields = ('name', 'legal_name', 'commercial_name', 'tax_id')
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    inlines = [ScheduleInline, RestaurantCategoryInline, RestaurantProductInline]

    fieldsets = (
        ('General Info', {
            'fields': ('name', 'description', 'status', 'image', 'image_preview')
        }),
        ('Legal & Contact Info', {
            'fields': (
                'legal_name', 'commercial_name', 'tax_id',
                'fiscal_address', 'email', 'phone'
            )
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'country', 'google_maps_embed_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'


@admin.register(RestaurantCategory)
class RestaurantCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'created_at')
    search_fields = ('name', 'restaurant__name')
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    fields = ('restaurant', 'name', 'description', 'image', 'image_preview', 'created_at', 'updated_at')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'


@admin.register(RestaurantProduct)
class RestaurantProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'category', 'price', 'is_available', 'created_at')
    search_fields = ('name', 'restaurant__name', 'category__name')
    list_filter = ('is_available', 'is_featured', 'is_recommended', 'is_new')
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    fields = (
        'restaurant', 'category', 'name', 'description', 'price',
        'is_available', 'is_featured', 'is_recommended', 'is_new',
        'image', 'image_preview', 'created_at', 'updated_at'
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'
