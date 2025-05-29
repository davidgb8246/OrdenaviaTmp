from uuid import uuid4
from django.db import models



class Schedule(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    restaurant = models.ForeignKey('Restaurant', on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    opening_time = models.TimeField(blank=False, null=False)
    closing_time = models.TimeField(blank=False, null=False)
    is_closed = models.BooleanField(default=False)
    shift_name = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.restaurant.name} - {self.get_day_of_week_display()} - {self.shift_name if self.shift_name else "General"} ({'Cerrado' if self.is_closed else 'Abierto'})"


class Restaurant(models.Model):
    def restaurant_image_upload_to(instance, filename):
        return f"restaurants/{instance.id}/{filename}"

    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('maintenance', 'Mantenimiento'),
        ('inactive', 'Inactivo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    legal_name = models.CharField(max_length=255, blank=True, null=True)
    commercial_name = models.CharField(max_length=255, blank=True, null=True)
    tax_id = models.CharField(max_length=100, blank=True, null=True)
    fiscal_address = models.TextField(blank=True, null=True)

    address = models.TextField(blank=False, null=False)
    city = models.CharField(max_length=100, blank=False, null=False)
    state = models.CharField(max_length=100, blank=False, null=False)
    country = models.CharField(max_length=100, blank=False, null=False)
    phone = models.CharField(max_length=50, blank=False, null=False)
    email = models.EmailField(max_length=100, blank=False, null=False)
    google_maps_embed_url = models.TextField(blank=True, null=True)

    image = models.ImageField(upload_to=restaurant_image_upload_to, blank=True, null=True, max_length=255)

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='inactive')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.email} - ({self.status})"


class RestaurantCategory(models.Model):
    def category_image_upload_to(instance, filename):
        return f"restaurants/{instance.restaurant.id}/categories/{instance.id}/{filename}"

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to=category_image_upload_to, blank=True, null=True, max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('restaurant', 'name')
        verbose_name_plural = 'Restaurant categories'

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class RestaurantProduct(models.Model):
    def product_image_upload_to(instance, filename):
        return f"restaurants/{instance.restaurant.id}/products/{instance.id}/{filename}"

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(RestaurantCategory, on_delete=models.CASCADE, related_name='products')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to=product_image_upload_to, blank=True, null=True, max_length=255)

    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_recommended = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"
