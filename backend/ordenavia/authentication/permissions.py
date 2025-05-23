from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied



class IsAuthenticatedAndHasAccount(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        if not hasattr(request.user, 'account'):
            raise PermissionDenied(detail="El usuario no tiene una cuenta válida.")

        return True
