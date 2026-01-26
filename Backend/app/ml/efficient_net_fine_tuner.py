import torch
import torch.nn as nn
import pytorch_lightning as pl
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class EfficientNetFineTuner(pl.LightningModule):
    def __init__(self, n_classes, lr_head=1e-3, lr_backbone=1e-4, weight_decay=1e-4):
        super().__init__()
        self.save_hyperparameters()

        weights = EfficientNet_B0_Weights.DEFAULT
        self.model = efficientnet_b0(weights=weights)

        in_features = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(in_features, n_classes)

        self.criterion = nn.CrossEntropyLoss()

    def forward(self, x):
        return self.model(x)
    
    def freeze_backbone(self):
        for param in self.model.features.parameters():
            param.requires_grad = False
        for param in self.model.classifier.parameters():
            param.requires_grad = True

    def unfreeze_last_n_blocks(self, n=3):
        for param in self.model.features[-n:].parameters():
            param.requires_grad = True

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

        self.log('train_loss', loss, prog_bar=True, on_epoch=True)
        self.log('train_acc', acc, prog_bar=True, on_epoch=True)
        return loss
    
    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

        self.log('val_loss', loss, prog_bar=True, on_epoch=True)
        self.log('val_acc', acc, prog_bar=True, on_epoch=True)

    def test_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

        self.log('test_loss', loss, prog_bar=True, on_epoch=True)
        self.log('test_acc', acc, prog_bar=True, on_epoch=True)

    def configure_optimizers(self):
        backbone_params = [param for param in self.model.features.parameters() if param.requires_grad]
        head_params = [param for param in self.model.classifier.parameters() if param.requires_grad]

        optimizer = torch.optim.AdamW([
            {'params': backbone_params, 'lr': self.hparams.lr_backbone},
            {'params': head_params, 'lr': self.hparams.lr_head}
        ], weight_decay=self.hparams.weight_decay)
        return optimizer