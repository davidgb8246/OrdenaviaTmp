from uuid import uuid4
from django.db import models
from django.contrib.auth.models import User
from management.models import Restaurant



class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=False)
    assignable = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    level = models.PositiveIntegerField(default=0)

    permissions = models.ManyToManyField(Permission, related_name='roles', blank=True)
    inherited_roles = models.ManyToManyField('self', symmetrical=False, related_name='child_roles', blank=True)

    def __str__(self):
        return f"{self.name} - {self.level}"

    def get_all_permissions(self):
        perms = set(self.permissions.all())
        for role in self.inherited_roles.all():
            perms.update(role.get_all_permissions())
        return perms

    def is_higher_than(self, other_role):
        return self.level > other_role.level


class Account(models.Model):
    GENDER_CHOICES = [
        ('M', 'Hombre'),
        ('F', 'Mujer'),
        ('O', 'Otro'),
    ]

    LANGUAGE_CHOICES = [
        ('es', 'Español'),
        ('en', 'Ingles'),
        ('fr', 'Frances'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')

    roles = models.ManyToManyField(Role, related_name='accounts', blank=True)
    custom_permissions = models.ManyToManyField(Permission, blank=True, related_name='custom_accounts')

    birth_date = models.DateField(null=True, blank=True)
    language = models.CharField(max_length=10, default='es', choices=LANGUAGE_CHOICES)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)

    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
    
    def get_all_permissions(self):
        perms = set()
        for role in self.roles.all():
            perms.update(role.get_all_permissions())

        perms.update(self.custom_permissions.all())
        return perms


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='profiles')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='profiles')
    
    roles = models.ManyToManyField(Role, related_name='profiles', blank=True)
    custom_permissions = models.ManyToManyField(Permission, blank=True, related_name='custom_profiles')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.account.user.username} @ {self.restaurant.name}'

    def get_all_permissions(self):
        perms = set()
        perms.update(self.account.get_all_permissions())

        for role in self.roles.all():
            perms.update(role.get_all_permissions())
        
        perms.update(self.custom_permissions.all())
        return perms

    def get_highest_role_level(self):
        if not self.roles.exists():
            return -1
        return max(role.level for role in self.roles.all())

    def can_assign_role(self, role: Role):
        return role.level < self.get_highest_role_level()
