from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0002_add_invite_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='musicgroup',
            name='is_public',
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]
