import React from 'react';
import { TRIGGER_TYPES } from '../../../../../app/scripts/controllers/metamask-notifications/constants/notification-schema';
import { CHAIN_IDS } from '../../../../../shared/constants/network';
import { t } from '../../../../../app/scripts/translate';

import { type ExtractedNotification, isOfTypeNodeGuard } from '../node-guard';
import type { NotificationComponent } from '../types/notifications/notifications';

import { shortenAddress } from '../../../../helpers/utils/util';
import { decimalToHex } from '../../../../../shared/modules/conversion.utils';

import {
  createTextItems,
  formatIsoDateString,
  getNetworkDetailsByChainId,
} from '../../../../helpers/utils/notification.util';
import {
  TextVariant,
  BackgroundColor,
  TextColor,
} from '../../../../helpers/constants/design-system';

import {
  NotificationListItem,
  NotificationDetailAddress,
  NotificationDetailInfo,
  NotificationDetailAsset,
  NotificationDetailNetworkFee,
  NotificationDetailButton,
  NotificationDetailTitle,
  NotificationDetailNft,
  NotificationDetailCollection,
} from '../../../../components/multichain';
import { NotificationListItemIconType } from '../../../../components/multichain/notification-list-item-icon/notification-list-item-icon';
import {
  BadgeWrapperPosition,
  IconName,
  ButtonVariant,
} from '../../../../components/component-library';

type ERC721Notification = ExtractedNotification<
  TRIGGER_TYPES.ERC721_RECEIVED | TRIGGER_TYPES.ERC721_SENT
>;
const isERC721Notification = isOfTypeNodeGuard([
  TRIGGER_TYPES.ERC721_RECEIVED,
  TRIGGER_TYPES.ERC721_SENT,
]);

const isSent = (n: ERC721Notification) => n.type === TRIGGER_TYPES.ERC721_SENT;
const title = (n: ERC721Notification) =>
  isSent(n)
    ? t('notificationItemNFTSentTo')
    : t('notificationItemNFTReceivedFrom');

const getTitle = (n: ERC721Notification) => {
  const address = shortenAddress(isSent(n) ? n.data.to : n.data.from);
  const items = createTextItems([title(n) || '', address], TextVariant.bodySm);
  return items;
};

const getDescription = (n: ERC721Notification) => {
  const items = createTextItems(
    [n.data.nft.collection.name],
    TextVariant.bodyMd,
  );
  return items;
};

export const components: NotificationComponent<ERC721Notification> = {
  guardFn: isERC721Notification,
  item: ({ notification, onClick }) => {
    return (
      <NotificationListItem
        id={notification.id}
        isRead={notification.isRead}
        icon={{
          type: NotificationListItemIconType.Nft,
          value: notification.data.nft.image,
          badge: {
            icon: isSent(notification)
              ? IconName.Arrow2UpRight
              : IconName.Received,
            position: BadgeWrapperPosition.bottomRight,
          },
        }}
        title={getTitle(notification)}
        description={getDescription(notification)}
        createdAt={new Date(notification.createdAt)}
        amount={`#${notification.data.nft.token_id}`}
        onClick={onClick}
      />
    );
  },
  details: {
    title: ({ notification }) => {
      const chainId = decimalToHex(notification.chain_id);
      const { nativeCurrencySymbol } = getNetworkDetailsByChainId(
        `0x${chainId}` as keyof typeof CHAIN_IDS,
      );
      return (
        <NotificationDetailTitle
          title={`${
            isSent(notification)
              ? t('notificationItemSent')
              : t('notificationItemReceived')
          } ${nativeCurrencySymbol}`}
          date={formatIsoDateString(notification.createdAt)}
        />
      );
    },
    body: {
      type: 'body_onchain_notification',
      Image: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo, nativeCurrencyName } =
          getNetworkDetailsByChainId(`0x${chainId}` as keyof typeof CHAIN_IDS);
        return (
          <NotificationDetailNft
            networkSrc={nativeCurrencyLogo}
            tokenId={notification.data.nft.token_id}
            tokenName={notification.data.nft.name}
            tokenSrc={notification.data.nft.image}
            networkName={nativeCurrencyName}
          />
        );
      },
      From: ({ notification }) => (
        <NotificationDetailAddress
          side={t('notificationItemFrom') || ''}
          address={notification.data.from}
        />
      ),
      To: ({ notification }) => (
        <NotificationDetailAddress
          side={t('notificationItemTo') || ''}
          address={notification.data.to}
        />
      ),
      Status: () => (
        <NotificationDetailInfo
          icon={{
            iconName: IconName.Check,
            color: TextColor.successDefault,
            backgroundColor: BackgroundColor.successMuted,
          }}
          label={t('notificationItemStatus') || ''}
          detail={t('notificationItemConfirmed') || ''}
        />
      ),
      Asset: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo } = getNetworkDetailsByChainId(
          `0x${chainId}` as keyof typeof CHAIN_IDS,
        );
        return (
          <NotificationDetailCollection
            icon={{
              src: notification.data.nft.image,
              badgeSrc: nativeCurrencyLogo,
            }}
            label={t('notificationItemCollection') || ''}
            collection={`${notification.data.nft.collection.name} (${notification.data.nft.token_id})`}
          />
        );
      },
      Network: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo, nativeCurrencyName } =
          getNetworkDetailsByChainId(`0x${chainId}` as keyof typeof CHAIN_IDS);

        return (
          <NotificationDetailAsset
            icon={{
              src: nativeCurrencyLogo,
            }}
            label={t('network') || ''}
            detail={nativeCurrencyName}
          />
        );
      },
      NetworkFee: ({ notification }) => {
        return <NotificationDetailNetworkFee notification={notification} />;
      },
    },
  },
  footer: {
    type: 'footer_onchain_notification',
    ScanLink: ({ notification }) => {
      const chainId = decimalToHex(notification.chain_id);
      const { nativeBlockExplorerUrl } = getNetworkDetailsByChainId(
        `0x${chainId}` as keyof typeof CHAIN_IDS,
      );
      return (
        <NotificationDetailButton
          variant={ButtonVariant.Secondary}
          text={t('notificationItemCheckBlockExplorer') || ''}
          href={
            nativeBlockExplorerUrl
              ? `${nativeBlockExplorerUrl}//tx/${notification.tx_hash}`
              : '#'
          }
          id={notification.id}
        />
      );
    },
  },
};
