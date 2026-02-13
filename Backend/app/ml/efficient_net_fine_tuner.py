import torch
import torch.nn as nn
import pytorch_lightning as pl
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class EfficientNetFineTuner(pl.LightningModule):
    def __init__(self, n_classes, lr_head=1e-3, lr_backbone=1e-4, weight_decay=1e-4):
        """
        A PyTorch Lightning module for fine-tuning an EfficientNet_B0 model on a custom plant classification task.
        """
        super().__init__()
        self.save_hyperparameters()

        # Load the EfficientNet_B0 model with pre-trained weights
        weights = EfficientNet_B0_Weights.DEFAULT
        self.model = efficientnet_b0(weights=weights)

        # Replace the final classification layer to match the number of classes in our dataset
        in_features = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(in_features, n_classes)

        self.criterion = nn.CrossEntropyLoss()

    def forward(self, x):
        """
        Forward pass through the model to get logits for the input batch of images.
        """
        return self.model(x)
    
    def freeze_backbone(self):
        """
        Freeze the backbone (feature extractor) layers of the model to prevent them from being updated during training.
        """
        # Freeze all layers in the backbone
        for param in self.model.features.parameters():
            param.requires_grad = False

        # Unfreeze the classifier head to allow training of the new layers
        for param in self.model.classifier.parameters():
            param.requires_grad = True

    def unfreeze_last_n_blocks(self, n=3):
        """
        Unfreeze the last n blocks of the backbone to allow fine-tuning of these layers.
        """
        for param in self.model.features[-n:].parameters():
            param.requires_grad = True

    def training_step(self, batch, batch_idx):
        """
        Perform a training step by computing the loss and accuracy for the current batch.
        Metrics logged for monitoring.
        """
        x, y = batch

        # Forward pass to get logits and compute loss and accuracy
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

        # Logging training loss and accuracy for monitoring
        self.log('train_loss', loss, prog_bar=True, on_epoch=True)
        self.log('train_acc', acc, prog_bar=True, on_epoch=True)
        return loss
    
    def validation_step(self, batch, batch_idx):
        """
        Perform a validation step by computing the loss and accuracy for the current batch.
        Metrics logged for monitoring.
        """
        x, y = batch

        # Forward pass to get logits and compute loss and accuracy
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

    # Logging validation loss and accuracy for monitoring
        self.log('val_loss', loss, prog_bar=True, on_epoch=True)
        self.log('val_acc', acc, prog_bar=True, on_epoch=True)

    def test_step(self, batch, batch_idx):
        """ 
        Perform a test step by computing the loss and accuracy for the current batch. 
        Metrics logged for monitoring. 
        """
        x, y = batch

        # Forward pass to get logits and compute loss and accuracy
        logits = self(x)
        loss = self.criterion(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()

        # Logging test loss and accuracy for monitoring
        self.log('test_loss', loss, prog_bar=True, on_epoch=True)
        self.log('test_acc', acc, prog_bar=True, on_epoch=True)

    def configure_optimizers(self):
        """
        Configure the optimizer with different learning rates for the backbone and head of the model.
        """
        backbone_params = [param for param in self.model.features.parameters() if param.requires_grad]
        head_params = [param for param in self.model.classifier.parameters() if param.requires_grad]

        optimizer = torch.optim.AdamW([
            {'params': backbone_params, 'lr': self.hparams.lr_backbone},
            {'params': head_params, 'lr': self.hparams.lr_head}
        ], weight_decay=self.hparams.weight_decay)
        return optimizer