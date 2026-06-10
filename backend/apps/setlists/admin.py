from django.contrib import admin

from .models import Setlist, SetlistItem


class SetlistItemInline(admin.TabularInline):
    model = SetlistItem
    extra = 0


@admin.register(Setlist)
class SetlistAdmin(admin.ModelAdmin):
    inlines = [SetlistItemInline]
    list_display = ['title', 'owner', 'group', 'event_date', 'created_at']
    list_filter = ['event_date']
    search_fields = ['title', 'owner__email']
    ordering = ['-event_date', 'title']


@admin.register(SetlistItem)
class SetlistItemAdmin(admin.ModelAdmin):
    list_display = ['setlist', 'order', 'song', 'transposition']
    search_fields = ['setlist__title', 'song__title']
