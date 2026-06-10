from django.contrib import admin

from .models import Membership, MusicGroup


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0


@admin.register(MusicGroup)
class MusicGroupAdmin(admin.ModelAdmin):
    inlines = [MembershipInline]
    list_display = ['name', 'owner', 'created_at']
    search_fields = ['name', 'owner__email']
    ordering = ['name']


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'group', 'role', 'joined_at']
    list_filter = ['role']
    search_fields = ['user__email', 'group__name']
