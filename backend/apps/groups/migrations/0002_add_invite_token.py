import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='musicgroup',
            name='invite_token',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, unique=True),
        ),
    ]
