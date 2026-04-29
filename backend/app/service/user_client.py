from ..db.models import User
from ..db.repos import UserRepo
from pwdlib import PasswordHash

DUMMY_HASH = PasswordHash.recommended().hash("dummypassword")


class UserAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class UserClient:
    def __init__(self, userRepo: UserRepo | None = None):
        self.userRepo = userRepo
        self.password_hash = PasswordHash.recommended()

    def createUser(self, username: str, password: str) -> User:
        existing_user = self.userRepo.searchByUsername(username)
        if existing_user is not None:
            raise UserAlreadyExistsError("username already exists")

        user = User(username=username, password=self.password_hash.hash(password))
        return self.userRepo.saveUser(user)

    def login(self, username: str, password: str) -> User:
        user = self.userRepo.searchByUsername(username=username)
        if user is None:
            self.password_hash.verify(password, DUMMY_HASH)
            raise InvalidCredentialsError("invalid username or password")
        if not self.password_hash.verify(password, user.password):
            raise InvalidCredentialsError("invalid username or password")
        return user

    def get_user(self, username: str):
        return self.userRepo.searchByUsername(username=username)
