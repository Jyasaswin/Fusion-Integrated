"""API permissions for Leave Management."""
from fusion_auth.permissions import HasModuleGrant, HasAnyPermission
from rest_framework.permissions import BasePermission


class HasModuleGrantLeave(HasModuleGrant):
    def __init__(self):
        super().__init__("leave_management")


class IsLeaveRequestOwnerOrApprover(BasePermission):
    """Object-level permission for leave requests."""

    def has_object_permission(self, request, view, obj):
        from fusion_auth.permissions import get_user_permissions

        perms = get_user_permissions(request.principal)
        user_id = request.principal.erp_user_id

        # Owner can view their own
        if obj.user_id == user_id:
            return True

        # Approvers can view if they have permission
        if "leave_management.leave_request.view" in perms:
            return True

        # Substitute can view substitute requests
        if "leave_management.substitute_request.view_self" in perms:
            if hasattr(obj, 'substitute_requests'):
                return obj.substitute_requests.filter(substitute_id=user_id).exists()

        return False


class CanModifyPendingLeave(BasePermission):
    """Check if user can modify a pending leave request."""

    def has_object_permission(self, request, view, obj):
        from fusion_auth.permissions import get_user_permissions

        perms = get_user_permissions(request.principal)
        user_id = request.principal.erp_user_id

        # Owner can modify if pending
        if obj.user_id == user_id and obj.status in ["draft", "submitted", "substitute_pending"]:
            return "leave_management.leave_request.modify_pending" in perms

        return False