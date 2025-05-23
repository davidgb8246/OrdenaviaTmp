from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import User
from authentication.models import Permission, Role, Account, Profile
from management.models import Restaurant



@receiver(post_migrate)
def create_auth_defaults(sender, **kwargs):
    if sender.label != 'authentication':
        return

    default_permissions = [
        { 'code': '*', 'name': 'Super user', 'description': 'Control completo sobre el sistema', 'assignable': False },
    ]

    for perm_data in default_permissions:
        Permission.objects.update_or_create(code=perm_data['code'], defaults=perm_data)


    admin_role, _ = Role.objects.get_or_create(name='admin', defaults={
        'description': 'Administrador con todos los permisos',
        'level': 100,
    })

    manager_role, _ = Role.objects.get_or_create(name='manager', defaults={
        'description': 'Gestor con permisos limitados',
        'level': 50,
    })

    # Assign all permissions to Admin
    if admin_role.permissions.count() == 0:
        admin_role.permissions.set(Permission.objects.filter(code='*'))
        admin_role.save()

    # --- Optionally: Create profile for first superuser & first restaurant ---
    if not Profile.objects.exists():
        try:
            user, created = User.objects.get_or_create(
                username="davidgb8246",
                defaults={
                    "email": "davidgballester@outlook.es",
                    "first_name": "David",
                    "last_name": "GB",
                    "is_active": True,
                    "is_staff": True,
                    "is_superuser": True,
                }
            )

            user.set_password("davidgballester@outlook.es")
            user.save()

            account, account_created = Account.objects.get_or_create(
                user=user,
                defaults={
                    "birth_date": "2005-06-21",
                    "phone": "+34600000000",
                    "gender": "M",
                    "language": "es",
                    "email_verified": False,
                    "phone_verified": False,
                }
            )

            account.roles.add(admin_role)
            account.save()

            print(f"🟢 Created default data.")
        except Exception as e:
            print(f"⚠️ Failed to auto-create default data: {e}")
