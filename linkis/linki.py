from typing import Iterator
from django.contrib.auth.models import User
from django.http import response
from django.shortcuts import get_object_or_404
from linki.connection import Connection
from linki.editor import Editor
from linki.repository import Repository, MemoryRepoConnection
from . import models
from django.db.models import Manager as DjangoManager
from msgspec import Struct, to_builtins
from linki.id import ID


class DjangoRepository(Repository):
    def __init__(self) -> None:
        self.connection = DjangoRepositoryConnection()
        # might want a LinkiRepoId or something here


class DjangoEditor(Editor):
    """
    Might need to customize Editor 
    """

    def __init__(self, repo: DjangoRepository) -> None:
        super().__init__(repo)
    pass


class DjangoConnection(Connection[Struct]):
    def __init__(self, manager: DjangoManager, user: User | None = None) -> None:
        self.store = manager
        self.user = user

    def __setitem__(self, __key: ID, __value: Struct) -> None:
        if (self.user is None):
            return None
        val = to_builtins(__value)
        self.store.update_or_create({
            "label_id": __key,
            "user": self.user,
            "data": val
        })

    def __delitem__(self, __key: ID) -> None:
        val: models.LinkiModel = get_object_or_404(self.store, label_id=__key)
        val.delete()

    def __getitem__(self, __key: ID) -> Struct:
        val: models.LinkiModel = get_object_or_404(self.store, label_id=__key)
        res: Struct = val.unload()
        return res

    def __iter__(self) -> Iterator[ID]:
        for x in self.store.values_list('pk', flat=True).iterator():
            yield ID(x)

    def __len__(self) -> int:
        return self.store.count()


class DjangoRepositoryConnection(MemoryRepoConnection):
    styles = {  # 'titles': models.Title.objects,
        # 'subs': models.Sub,
        # 'contribs': models.Contrib,
        # 'drafts': models.Draft,
        'articles': models.Article.objects,
        # 'users': models.ContribUser,
        # 'changes': models.Change,
        # 'config': models.Config
    }

    def get_style(self, style: str, user: User | None = None) -> DjangoConnection:
        model: DjangoManager = self.styles[style]  # type: ignore
        if (user is not None):
            model = model.filter(user=user)
        return DjangoConnection(model, user)