/** biome-ignore-all lint/complexity/noForEach: safe */
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
import { normalise } from "@ensdomains/ensjs/utils";
import { type Address, zeroAddress } from "viem";

import { getSecondsRemaining, toLLMDate } from "@/helpers";

import type { EnsClient } from "./ens-client";
import type { EnsProfile, GenericName, GetEnsProfileParams } from "./schema";

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
