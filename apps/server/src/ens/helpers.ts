/** biome-ignore-all lint/complexity/noForEach: safe */
/** biome-ignore-all lint/suspicious/noExplicitAny: safe */
import {
  batch,
  type GetContentHashRecordReturnType,
  type GetExpiryReturnType,
  type GetOwnerReturnType,
  type GetResolverReturnType,
  getAddressRecord,
  getContentHashRecord,
  getExpiry,
  getOwner,
  getResolver,
  getTextRecord,
} from "@ensdomains/ensjs/public";
import type { Name } from "@ensdomains/ensjs/subgraph";
import { decodeFuses, normalise } from "@ensdomains/ensjs/utils";
import { type Address, zeroAddress } from "viem";

import { getSecondsRemaining, toLLMDate } from "@/helpers";

import type { EnsClient } from "./ens-client";
import type {
  EnsProfile,
  GenericEvent,
  GenericName,
  GetEnsProfileParams,
  GetNameHistoryParams,
} from "./schema";

export const getEnsProfileInternal = async (
  client: EnsClient,
  params: GetEnsProfileParams,
) => {
  const textRecordsCall = (params.textRecords ?? []).map((record) =>
    getTextRecord.batch({ key: record, name: params.name }),
  );
  const addressRecordCalls = (params.coinRecords ?? []).map((record) =>
    getAddressRecord.batch({ coin: record, name: params.name }),
  );

  const contentHashCall = getContentHashRecord.batch({
    name: params.name,
  });

  const resolverCall = getResolver.batch({ name: params.name });
  const expiryCall = getExpiry.batch({ name: params.name });
  const ownerCall = getOwner.batch({ name: params.name });

  const res = await batch(
    client,
    ...textRecordsCall,
    ...addressRecordCalls,
    contentHashCall,
    resolverCall,
    expiryCall,
    ownerCall,
  );

  const records: EnsProfile["records"] = [];
  const addresses: EnsProfile["addresses"] = [];

  res.slice(0, textRecordsCall.length).forEach((r, i) => {
    const record = r as string | null;
    const textKey = (params.textRecords ?? [])[i] as string;
    records.push({
      key: textKey,
      value: record ?? "",
    });
  });

  res
    .slice(
      textRecordsCall.length,
      textRecordsCall.length + addressRecordCalls.length,
    )
    .forEach((r) => {
      const record = r as {
        id: number;
        name: string;
        value: Address;
      } | null;

      if (!record) return;
      addresses.push({
        coinType: record.id,
        symbol: record.name,
        value: record.value,
      });
    });

  const contentHash =
    (res.at(
      textRecordsCall.length + addressRecordCalls.length,
    ) as GetContentHashRecordReturnType) ?? undefined;

  const resolverAddress = res.at(
    textRecordsCall.length + addressRecordCalls.length + 1,
  ) as GetResolverReturnType;

  const e = res.at(
    textRecordsCall.length + addressRecordCalls.length + 2,
  ) as GetExpiryReturnType;

  const expiry = (() => {
    if (!e) return null;
    const expiryDate = e.expiry.date;
    const gradePeriodEndDate = new Date(
      expiryDate.getTime() + e.gracePeriod * 1000,
    );

    return {
      gracePeriodEndsAt: gradePeriodEndDate.getTime() / 1000,
      gracePeriodEndsAtIso: gradePeriodEndDate.toISOString(),
      secondsRemaining: getSecondsRemaining(gradePeriodEndDate),
      status: e.status,
      ...toLLMDate(expiryDate),
    };
  })();

  const o = res.at(
    textRecordsCall.length + addressRecordCalls.length + 3,
  ) as GetOwnerReturnType;

  const ownerAddress = o?.owner ?? zeroAddress;

  const data: EnsProfile = {
    addresses,
    contentHash,
    expiry,
    isWrapped: o?.ownershipLevel === "nameWrapper",
    name: params.name,
    normalizedName: normalise(params.name),
    ownerAddress,
    records,
    resolverAddress,
  };

  return data;
};

export const nameToGenericName = (name: Name): GenericName => {
  const registrationDate = name.registrationDate?.date ?? new Date();
  const expiryDate = name.expiryDate?.date ?? new Date();
  const creationDate = name.createdAt?.date ?? new Date();

  return {
    creation: toLLMDate(creationDate),
    expiry: {
      ...toLLMDate(expiryDate),
      secondsRemaining: getSecondsRemaining(expiryDate),
    },
    isWrapped: name.wrappedOwner !== null,
    name: name.name ?? "",
    ownerAddress: name.wrappedOwner ?? name.owner,
    registration: toLLMDate(registrationDate),
    resolverAddress: name.resolvedAddress ?? zeroAddress,
  };
};

export const getNameHistoryInternal = async (
  client: EnsClient,
  params: GetNameHistoryParams,
) => {
  const res = await client.getNameHistory(params);

  const events: GenericEvent[] = [];

  res?.domainEvents.forEach((e) => {
    const commonData = {
      blockNumber: e.blockNumber,
      eventType: e.type,
      txHash: e.transactionID,
    };
    const data: Record<string, any> = {};
    if (e.type === "Transfer") {
      data.owner = e.owner;
    } else if (e.type === "NewOwner") {
      data.owner = e.owner;
    } else if (e.type === "NameWrapped") {
      data.owner = e.owner;
      data.expiryDate = e.expiryDate;
    } else if (e.type === "NameUnwrapped") {
      data.owner = e.owner;
    } else if (e.type === "WrappedTransfer") {
      data.owner = e.owner;
    } else if (e.type === "NewResolver") {
      data.resolver = e.resolver;
    } else if (e.type === "NewTTL") {
      data.ttl = e.ttl;
    } else if (e.type === "ExpiryExtended") {
      data.expiryDate = e.expiryDate;
    } else {
      const decodedFuses = decodeFuses(e.fuses);
      const { unnamed, ...restChild } = decodedFuses.child;
      const { unnamed: unnamedParent, ...restParent } = decodedFuses.parent;
      data.childFuses = restChild;
      data.parentFuses = restParent;
    }

    events.push({
      ...commonData,
      data,
    });
  });

  res?.registrationEvents?.forEach((e) => {
    const commonData = {
      blockNumber: e.blockNumber,
      eventType: e.type,
      txHash: e.transactionID,
    };
    const data: Record<string, any> = {};
    if (e.type === "NameRegistered") {
      data.registrant = e.registrant;
      data.expiryDate = e.expiryDate;
    } else if (e.type === "NameRenewed") {
      data.newExpiryDate = e.expiryDate;
    } else {
      data.newOwner = e.newOwner;
    }

    events.push({
      ...commonData,
      data,
    });
  });

  res?.resolverEvents?.forEach((e) => {
    const commonData = {
      blockNumber: e.blockNumber,
      eventType: e.type,
      txHash: e.transactionID,
    };
    const data: Record<string, any> = {};
    if (e.type === "AbiChanged") {
      data.contentType = e.contentType;
    } else if (e.type === "AddrChanged") {
      data.addr = e.addr;
    } else if (e.type === "AuthorisationChanged") {
      data.isAuthorized = e.isAuthorized;
      data.target = e.target;
      data.owner = e.owner;
    } else if (e.type === "ContenthashChanged") {
      data.newContentHash = e.contentHash;
      data.newProtocolType = e.protocolType;
      data.newDecoded = e.decoded;
    } else if (e.type === "InterfaceChanged") {
      data.interfaceID = e.interfaceID;
      data.implementer = e.implementer;
    } else if (e.type === "MulticoinAddrChanged") {
      data.coinType = e.coinType;
      data.addr = e.addr;
      data.coinName = e.coinName;
    } else if (e.type === "NameChanged") {
      data.name = e.name;
    } else if (e.type === "PubkeyChanged") {
      data.x = e.x;
      data.y = e.y;
    } else if (e.type === "TextChanged") {
      data.key = e.key;
      data.value = e.value;
    } else {
      data.version = e.version;
    }

    events.push({
      ...commonData,
      data,
    });
  });

  return {
    events: events.sort((a, b) => a.blockNumber - b.blockNumber),
  };
};
