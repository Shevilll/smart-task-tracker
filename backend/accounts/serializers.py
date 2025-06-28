from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    admin_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "role",
            "first_name",
            "last_name",
            "admin_key",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")

        # Check admin key if user is trying to register as admin
        if attrs.get("role") == "admin":
            admin_key = attrs.get("admin_key", "")
            if admin_key != settings.ADMIN_REGISTRATION_KEY:
                raise serializers.ValidationError("Invalid admin registration key")

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        validated_data.pop("admin_key", None)  # Remove admin_key from validated_data
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            attrs["user"] = user
        else:
            raise serializers.ValidationError("Must include username and password")

        return attrs
