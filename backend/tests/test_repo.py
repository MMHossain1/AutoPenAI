import pytest
from app.db import database
from app.db.models import User, Scan, Domain
from app.db.repos import UserRepo, ScanRepo

import datetime

database.init_db()


@pytest.fixture(autouse=True)
def clean_db():
    session = database.Session()
    session.query(Scan).delete()
    session.query(Domain).delete()
    session.query(User).delete()
    session.commit()
    session.close()

    yield


@pytest.fixture
def db():
    session = next(database.get_db())

    yield session

    session.close()


@pytest.fixture
def user_repo(db):
    return UserRepo(db)


@pytest.fixture
def scan_repo(db):
    return ScanRepo(db)


@pytest.fixture
def user():
    return User(username="luanders", password="testpassword")


@pytest.fixture
def scan():
    return Scan(date=datetime.datetime.now(),
                scan_log={
                            "alerts":
                            {
                                "alert":
                                {
                                    "id": 6,
                                    "name": "Path Traversal",
                                    "risk": "High"
                                },
                            }
                         },
                target_url="http://localhost:3000")


@pytest.fixture
def scan2():
    return Scan(date=datetime.datetime.now(),
                scan_log={
                            "alerts":
                            {
                                "alert":
                                {
                                    "id": 10,
                                    "name": "CORS Misconfiguration",
                                    "risk": "Low"
                                },
                            }
                         },
                target_url="http://localhost:3000")


def test_add_user(user_repo, user):
    user_repo.saveUser(user)


def test_search_by_username(user_repo, user):
    user_repo.saveUser(user)

    result = user_repo.searchByUsername(user.username)
    assert result is not None
    assert result.username == user.username


def test_add_scan(scan_repo, user_repo, scan, user):
    user_repo.saveUser(user)
    scan_repo.saveScan(scan, user)


def test_search_scan(scan_repo, user_repo, scan, user):
    user_repo.saveUser(user)
    scan_repo.saveScan(scan, user)
    result = scan_repo.searchByScanID(scan.scanid)
    assert result is not None
    assert result.scanid == scan.scanid


def test_relationships(scan_repo, user_repo, user, scan, scan2):
    user_repo.saveUser(user)
    scan_repo.saveScan(scan, user)
    scan_repo.saveScan(scan2, user)
    assert user.domains is not None
    assert len(user.domains) == 1
    assert len(user.domains[0].scans) == 2
