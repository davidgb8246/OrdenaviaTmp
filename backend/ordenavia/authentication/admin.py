from django.contrib import admin
from authentication.models import Account, Permission, Role, Profile



@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'email_verified',
        'phone_verified',
        'language',
        'gender',
        'birth_date',
        'created_at',
        'roles_list',
    )
    list_filter = ('email_verified', 'phone_verified', 'language', 'gender', 'created_at', 'roles')
    search_fields = ('user__username', 'user__email', 'phone')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('roles', 'custom_permissions')

    fieldsets = (
        (None, {
            'fields': ('user', 'birth_date', 'language', 'gender', 'phone', 'avatar_url')
        }),
        ('Roles & Permissions', {
            'fields': ('roles', 'custom_permissions'),
        }),
        ('Verification', {
            'fields': ('email_verified', 'phone_verified'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def roles_list(self, obj):
        roles = obj.roles.all().order_by('-level')
        return ', '.join(role.name for role in roles) if roles else '-'
    roles_list.short_description = 'Roles'


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'assignable')
    list_filter = ('assignable',)
    search_fields = ('code', 'name', 'description')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'description_short')
    search_fields = ('name', 'description')
    filter_horizontal = ('permissions', 'inherited_roles')

    def description_short(self, obj):
        return (obj.description[:75] + '...') if obj.description and len(obj.description) > 75 else obj.description
    description_short.short_description = 'Description'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('account_username', 'restaurant', 'is_active', 'roles_list')
    list_filter = ('is_active', 'restaurant')
    search_fields = ('account__user__username', 'restaurant__name')
    filter_horizontal = ('roles', 'custom_permissions')

    def account_username(self, obj):
        return obj.account.user.username
    account_username.short_description = 'User'

    def roles_list(self, obj):
        roles = obj.roles.all().order_by('-level')
        return ', '.join(role.name for role in roles) if roles else '-'
    roles_list.short_description = 'Roles'
