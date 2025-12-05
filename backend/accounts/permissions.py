"""
Permission helpers for role-based access control
"""
from functools import wraps
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import status


def user_in_group(user, group_name):
    """Check if user belongs to a specific group"""
    return user.groups.filter(name=group_name).exists()


def user_has_any_group(user, group_names):
    """Check if user belongs to any of the specified groups"""
    return user.groups.filter(name__in=group_names).exists()


# Permission classes for DRF views
class IsHRRecruiter(BasePermission):
    """Only HR Recruiters can access"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and user_in_group(request.user, 'HR Recruiter')


class IsHRManager(BasePermission):
    """Only HR Managers can access"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and user_in_group(request.user, 'HR Manager')


class IsITSupport(BasePermission):
    """Only IT Support can access"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and user_in_group(request.user, 'IT Support')


class IsHRStaff(BasePermission):
    """HR Recruiter OR HR Manager can access"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and user_has_any_group(
            request.user, ['HR Recruiter', 'HR Manager']
        )


class IsHRManagerOrITSupport(BasePermission):
    """HR Manager OR IT Support can access"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and user_has_any_group(
            request.user, ['HR Manager', 'IT Support']
        )


# View decorators
def require_group(group_name):
    """Decorator to require specific group membership"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'detail': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user_in_group(request.user, group_name):
                return Response(
                    {'detail': f'Access denied. Requires {group_name} role.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator


def require_any_group(*group_names):
    """Decorator to require any of the specified groups"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'detail': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user_has_any_group(request.user, group_names):
                return Response(
                    {'detail': f'Access denied. Requires one of: {", ".join(group_names)}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator
