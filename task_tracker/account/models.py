from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class CustomUser(AbstractUser):
    middle_name = models.CharField(
        max_length=255, verbose_name="Отчество", default="", null=True
    )
