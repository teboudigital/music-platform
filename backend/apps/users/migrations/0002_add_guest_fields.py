import uuid
from django.db import migrations, models


def generate_guest_tokens(apps, schema_editor):
    CustomUser = apps.get_model('users', 'CustomUser')
    for user in CustomUser.objects.all():
        user.guest_token = uuid.uuid4()
        user.save(update_fields=['guest_token'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='is_guest',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customuser',
            name='guest_token',
            field=models.UUIDField(null=True, blank=True),
        ),
        migrations.RunPython(generate_guest_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customuser',
            name='guest_token',
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
