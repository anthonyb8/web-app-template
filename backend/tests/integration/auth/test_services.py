# pyright: reportOptionalMemberAccess=none, reportArgumentType=none
import asyncio
import time
import unittest
from fastapi import HTTPException
from app.auth.schemas import (
    RefreshToken,
    RegisterRequest,
    UserUpdate,
    VerificationToken,
)
from app.auth.utils import SecurityService
from app.database import database
from app.auth.services import (
    EmailMfaCodeService,
    RecoveryCodeService,
    UserService,
    TokenService,
)
import datetime as dt
from datetime import datetime, timedelta


email = "test@gmail.com"
password = "test_password"
user_create = RegisterRequest(email=email, password=password)


class TestUserService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        await database.connect()
        asyncio.get_event_loop().set_debug(False)

    async def asyncTearDown(self) -> None:
        await database.disconnect()

    async def test_create_user(self):
        await UserService.create_user(email, password)

        user1 = await UserService.get_user_by_email(email)
        assert user1
        self.assertEqual(user1.email, email)

        resp = await UserService.check_user_exists(email)
        self.assertTrue(resp)

        # Clean-up
        await UserService.delete_user(email, password)
        resp = await UserService.check_user_exists(email)
        self.assertFalse(resp)

    async def test_update_user(self):
        await UserService.create_user(email, password)

        user = await UserService.get_user_by_email(email)
        assert user
        self.assertEqual(user.email, email)

        new_email = "test2@gmail.com"
        last_login = dt.datetime.now(dt.timezone.utc)
        update_user = UserUpdate()
        update_user.email = new_email
        update_user.last_login = last_login
        update_user.authenticator_mfa_enabled = True

        await UserService.update_user(user.id, update_user)

        # Check
        user = await UserService.get_user_by_email(new_email)

        assert user
        self.assertEqual(user.email, new_email)
        self.assertEqual(user.authenticator_mfa_enabled, True)
        self.assertIsNotNone(user.last_login)

        # Clean-up
        await UserService.delete_user(new_email, password)

    async def test_get_user(self):
        user = await UserService.create_user(email, password)

        # Email
        user1 = await UserService.get_user_by_email(email)
        assert user1
        self.assertEqual(user1.email, email)

        # ID
        user2 = await UserService.get_user_by_id(user.id)
        assert user2
        self.assertEqual(user2.email, email)

        # Clean-up
        await UserService.delete_user(email, password)

    async def test_check_user_exists(self):
        await UserService.create_user(email, password)

        resp = await UserService.check_user_exists(email)
        self.assertTrue(resp)

        # Clean-up
        await UserService.delete_user(email, password)

    async def test_validate_user(self):
        await UserService.create_user(email, password)

        resp = await UserService.validate_user(email, password)
        self.assertTrue(resp)

        # Clean-up
        await UserService.delete_user(email, password)


email = "test38@gmail.com"
password = "test_password"


class TestEmailMfaCodes(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        await database.connect()
        asyncio.get_event_loop().set_debug(False)

    async def asyncTearDown(self) -> None:
        await database.disconnect()

    async def test_create_mfa_codes(self):
        user = await UserService.create_user(email, password)
        code = await EmailMfaCodeService.create_email_mfa_code(
            user.id, timedelta(minutes=5)
        )

        self.assertTrue(len(code) == 6)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_verify_mfa_codes(self):
        user = await UserService.create_user(email, password)
        code = await EmailMfaCodeService.create_email_mfa_code(
            user.id, timedelta(minutes=5)
        )

        # Test
        result = await EmailMfaCodeService.verify_email_mfa_code(user.id, code)
        self.assertTrue(result)

        check_deleted = await EmailMfaCodeService.verify_email_mfa_code(
            user.id, code
        )
        self.assertFalse(check_deleted)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_expired_mfa_codes(self):
        user = await UserService.create_user(email, password)
        code = await EmailMfaCodeService.create_email_mfa_code(
            user.id, timedelta(minutes=-5)
        )

        # Test
        result = await EmailMfaCodeService.verify_email_mfa_code(user.id, code)
        self.assertFalse(result)

        # Cleanup
        await UserService.delete_user(email, password)


email = "test33@gmail.com"
password = "test_password"


class TestRecoveryCodeService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        await database.connect()
        asyncio.get_event_loop().set_debug(False)

    async def asyncTearDown(self) -> None:
        await database.disconnect()

    async def test_create_recovery_codes(self):
        user = await UserService.create_user(email, password)
        codes = await RecoveryCodeService.create_recovery_codes(user.id)

        self.assertTrue(len(codes) == 10)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_verify_recovery_code_true(self):
        user = await UserService.create_user(email, password)
        codes = await RecoveryCodeService.create_recovery_codes(user.id)

        self.assertTrue(len(codes) == 10)

        result = await RecoveryCodeService.verify_recovery_code(
            user.id,
            codes[0],
        )
        self.assertTrue(result)

        result = await RecoveryCodeService.verify_recovery_code(
            user.id,
            codes[0],
        )
        self.assertFalse(result)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_verify_recovery_false(self):
        user = await UserService.create_user(email, password)

        _ = await RecoveryCodeService.create_recovery_codes(user.id)
        result = await RecoveryCodeService.verify_recovery_code(
            user.id,
            "invalid",
        )
        self.assertFalse(result)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_regenerate_codes(self):
        user = await UserService.create_user(email, password)
        codes = await RecoveryCodeService.create_recovery_codes(user.id)

        for c in codes:
            self.assertTrue(
                await RecoveryCodeService.verify_recovery_code(user.id, c)
            )

        new_codes = await RecoveryCodeService.regenerate_recovery_codes(
            user.id
        )

        for c in codes:
            self.assertFalse(
                await RecoveryCodeService.verify_recovery_code(user.id, c)
            )

        for c in new_codes:
            self.assertTrue(
                await RecoveryCodeService.verify_recovery_code(user.id, c)
            )

        # Cleanup
        await UserService.delete_user(email, password)


token = "token"
refresh_token = RefreshToken(
    id=0,
    user_id=1,
    token_hash=SecurityService.hash_token(token),
    expires_at=datetime.now(dt.timezone.utc),
    created_at=None,
)

email = "test3@gmail.com"
password = "test_password"


class TestRefreshTokenService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        await database.connect()
        asyncio.get_event_loop().set_debug(False)

    async def asyncTearDown(self) -> None:
        await database.disconnect()

    async def test_create_refresh_token(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id

        await TokenService.create_refresh_token(refresh_token)

        got_token = await TokenService.get_refresh_token(token)
        assert got_token

        self.assertEqual(got_token.token_hash, refresh_token.token_hash)
        self.assertEqual(got_token.user_id, user.id)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_get_refresh_token(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id

        await TokenService.create_refresh_token(refresh_token)

        got_token = await TokenService.get_refresh_token(token)
        assert got_token

        self.assertEqual(got_token.token_hash, refresh_token.token_hash)
        self.assertEqual(got_token.user_id, user.id)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_delete_expired_refresh_token(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id
        refresh_token.expires_at = datetime.now(dt.timezone.utc) - timedelta(
            days=1
        )
        await TokenService.create_refresh_token(refresh_token)

        got_token = await TokenService.get_refresh_token(token)
        self.assertEqual(got_token.token_hash, refresh_token.token_hash)

        time.sleep(5)

        await TokenService.delete_expired_refresh_tokens(user.id)
        got_token = await TokenService.get_refresh_token(token)
        self.assertIsNone(got_token)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_delete_refresh_token(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id
        refresh_token.expires_at = datetime.now(dt.timezone.utc) - timedelta(
            days=1
        )
        await TokenService.create_refresh_token(refresh_token)

        got_token = await TokenService.get_refresh_token(token)
        self.assertEqual(got_token.token_hash, refresh_token.token_hash)

        time.sleep(5)

        await TokenService.delete_refresh_token(token, user.id)
        got_token = await TokenService.get_refresh_token(token)
        self.assertIsNone(got_token)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_refresh_token_valid(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id
        refresh_token.expires_at = datetime.now(dt.timezone.utc) + timedelta(
            days=1
        )

        await TokenService.create_refresh_token(refresh_token)

        # Test
        token_response = await TokenService.refresh_token(token)
        self.assertIsNotNone(token_response.access_token)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_refresh_token_expired(self):
        user = await UserService.create_user(email, password)
        refresh_token.user_id = user.id
        refresh_token.expires_at = datetime.now(dt.timezone.utc) - timedelta(
            days=1
        )
        await TokenService.create_refresh_token(refresh_token)

        # Test
        with self.assertRaises(HTTPException) as e:
            await TokenService.refresh_token(token)

        self.assertEqual(e.exception.status_code, 401)
        self.assertIn("Refresh token is expired", str(e.exception.detail))

        # Cleanup
        await UserService.delete_user(email, password)


token = "token"
v_token = VerificationToken(
    id=0,
    user_id=1,
    token_hash=SecurityService.hash_token(token),
    token_type="email_verification",
    expires_at=datetime.now(dt.timezone.utc),
    created_at=None,
)

email = "test7@gmail.com"
password = "test_password"


class TestVerificationTokenService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        await database.connect()
        asyncio.get_event_loop().set_debug(False)

    async def asyncTearDown(self) -> None:
        await database.disconnect()

    async def test_create_verification_token(self):
        user = await UserService.create_user(email, password)
        v_token.user_id = user.id

        await TokenService.create_verification_token(v_token)

        got_token = await TokenService.get_verification_token(
            token, v_token.token_type
        )
        assert got_token

        self.assertEqual(got_token.token_hash, v_token.token_hash)
        self.assertEqual(got_token.user_id, user.id)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_get_verification_token(self):
        user = await UserService.create_user(email, password)
        v_token.user_id = user.id

        await TokenService.create_verification_token(v_token)

        got_token = await TokenService.get_verification_token(
            token, v_token.token_type
        )
        assert got_token

        self.assertEqual(got_token.token_hash, v_token.token_hash)
        self.assertEqual(got_token.user_id, user.id)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_delete_expired_verification_token(self):
        user = await UserService.create_user(email, password)
        v_token.user_id = user.id
        v_token.expires_at = datetime.now(dt.timezone.utc) - timedelta(days=1)
        await TokenService.create_verification_token(v_token)

        got_token = await TokenService.get_verification_token(
            token, v_token.token_type
        )
        self.assertEqual(got_token.token_hash, v_token.token_hash)

        time.sleep(5)

        await TokenService.delete_verification_token(user.id)
        got_token = await TokenService.get_refresh_token(token)
        self.assertIsNone(got_token)

        # Cleanup
        await UserService.delete_user(email, password)

    async def test_delete_verification_token(self):
        user = await UserService.create_user(email, password)
        v_token.user_id = user.id
        v_token.expires_at = datetime.now(dt.timezone.utc) - timedelta(days=1)
        await TokenService.create_verification_token(v_token)

        got_token = await TokenService.get_verification_token(
            token, v_token.token_type
        )
        self.assertEqual(got_token.token_hash, v_token.token_hash)

        time.sleep(5)

        await TokenService.delete_verification_token(user.id)
        got_token = await TokenService.get_refresh_token(token)
        self.assertIsNone(got_token)

        # Cleanup
        await UserService.delete_user(email, password)
