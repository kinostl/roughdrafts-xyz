# Generated by Django 4.2.2 on 2023-06-23 12:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pastes', '0006_paste_privacy'),
    ]

    operations = [
        migrations.AddField(
            model_name='paste',
            name='title',
            field=models.CharField(blank=True, max_length=140),
        ),
    ]