from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Profile


class ProfileInline(admin.StackedInline):
    model = Profile
    extra = 0


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    inlines = [ProfileInline]
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Informazioni personali', {'fields': ('first_name', 'last_name')}),
        ('Permessi', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Date importanti', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_language', 'created_at']
    list_filter = ['preferred_language']
    search_fields = ['user__email']
