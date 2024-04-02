const {
  createAchAccount,
  fundTrade,
  getAchTransfer,
  getAchTransferInfo,
  getAchTransferHistory,
  getAchAccount,
  updateAchAccount,
  voidAchTransfer,
  deleteAchAccount,
} = require('.');
const { hasRequiredFields } = require('./util');
const { accounts, links, offerings, trades } = require('..');

jest.setTimeout(20000);

describe('ach (external accounts)', () => {
  let offeringId;
  let accountId;
  let tradeId;
  let wireTradeId;
  let testReferenceNumber;
  beforeAll(async () => {
    const { data: offering } = await offerings.createOffering({
      issuerId: process.env.TAPI_TEST_ISSUER_ID,
      issueName: 'Test issue',
      issueType: 'Equity',
      minAmount: '1',
      targetAmount: '5',
      maxAmount: '10',
      remainingShares: '10',
      unitPrice: '1',
      startDate: '01-01-1970',
      endDate: '01-01-1970',
      offeringText: 'n/a',
      stampingText: 'n/a',
    });
    if (offering.statusCode !== '101') throw offering;
    offeringId = offering.offeringDetails[1][0].offeringId;
    const user = {
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data: account } = await accounts.createAccount(user);
    if (account.statusCode !== '101') throw account;
    accountId = account.accountDetails[0].accountId;
    await links.linkAccountOwner(accountId, global.partyId);
    const { data: trade } = await trades.createTrade({
      transactionType: 'ACH',
      transactionUnits: '1',
      offeringId,
      accountId,
    });
    tradeId = trade.purchaseDetails[1][0].tradeId;
    const { data: wireTrade } = await trades.createTrade({
      transactionType: 'WIRE',
      transactionUnits: '1',
      offeringId,
      accountId,
    });
    wireTradeId = wireTrade.purchaseDetails[1][0].tradeId;
  });
  afterAll(async () => {
    await accounts.deleteAccount(accountId);
    await offerings.deleteOffering(offeringId);
  });

  let createdAchAccountId;
  const invalidAccount = {
    type: 'account',
    accountId: 'accountId',
    accountHolderName: 'account holder name',
    accountName: 'account name',
    routingNumber: '021000021',
    accountNumber: '12345',
    bankName: 'bank name',
    updatedIpAddress: 'updated Ip address',
    accountType: 'checking',
  };
  const validAccount = (id) => ({
    type: 'Account',
    accountId: id,
    accountHolderName: 'account holder name',
    accountName: 'account name',
    routingNumber: '021000021',
    accountNumber: '12345',
    bankName: 'bank name',
    updatedIpAddress: '0.0.0.0',
    accountType: 'Checking',
  });
  it('createAchAccount (createExternalAccount) -- missing required field (account holder)', async () => {
    const account = {
      type: 'account',
      accountId: 'accountId',
      accountName: 'account name',
      routingNumber: 'routing number',
      accountNumber: 'account number',
      bankName: 'bank name',
      updatedIpAddress: 'updated Ip address',
      accountType: 'checking',
    };
    expect(hasRequiredFields(account)).toBe(false);
    const { data } = await createAchAccount(account);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data.statusCode).toEqual('106');
  });
  it('createAchAccount (createExternalAccount) -- invalid fields', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await createAchAccount(invalidAccount);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data['']).toBe(null);
  });
  it('createAchAccount (createExternalAccount) -- invalid type and accountId', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await createAchAccount({ ...invalidAccount, accountType: 'Checking' });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data['']).toBe(null);
  });
  it('createAchAccount (createExternalAccount) -- invalid accountType and accountId', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await createAchAccount({ ...invalidAccount, type: 'Account' });
    expect(data.statusDesc).toEqual('Account ID is not EXIST / ACTIVE');
    expect(data.statusCode).toEqual('135');
    expect(data['']).toBe(undefined);
    expect(data['External Account Details']).toBe(undefined);
  });
  it('createAchAccount (createExternalAccount) -- invalid accountType -- PASSES', async () => {
    // According to documentation this is invalid input
    const user = {
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data: account } = await accounts.createAccount(user);
    if (account.statusCode !== '101') throw account;
    const tempAccountId = account.accountDetails[0].accountId;
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await createAchAccount({
      ...invalidAccount,
      type: 'Account',
      accountType: 'invalid-account-type',
      accountId: tempAccountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId: tempAccountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa(invalidAccount.accountNumber),
      ExtRoutingnumber: btoa(invalidAccount.routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
    await accounts.deleteAccount(tempAccountId);
  });
  it('createAchAccount (createExternalAccount)', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await createAchAccount(validAccount(accountId));
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa(validAccount(accountId).accountNumber),
      ExtRoutingnumber: btoa(validAccount(accountId).routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
    createdAchAccountId = 'account name';
  });
  it('createAchAccount (createExternalAccount) -- account already linked to external account', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await createAchAccount(validAccount(accountId));
    expect(data.statusDesc).toEqual('This acoount already has external financial account.');
    expect(data.statusCode).toEqual('116');
  });
  it('fundTrade (externalFundMove) -- invalid account ID', async () => {
    const validTrade = {
      accountId: 'invalid-account-id',
      offeringId,
      tradeId,
      amount: '1',
      description: 'test fund move',
      checkNumber: tradeId,
      accountName: createdAchAccountId,
    };
    const { data } = await fundTrade(validTrade);
    expect(data.statusDesc).toEqual('NO_PARTY_ID_148_DESC');
    expect(data.statusCode).toEqual('NO_PARTY_ID_148');
  });
  it('fundTrade (externalFundMove) -- invalid offering ID', async () => {
    const validTrade = {
      accountId,
      offeringId: 'invalid-offering-id',
      tradeId,
      amount: '1',
      description: 'test fund move',
      checkNumber: tradeId,
      accountName: createdAchAccountId,
    };
    const { data } = await fundTrade(validTrade);
    expect(data.statusDesc).toEqual('Trade Account does not exist');
    expect(data.statusCode).toEqual('188');
  });
  it('fundTrade (externalFundMove) -- invalid trade ID', async () => {
    const validTrade = {
      accountId,
      offeringId,
      tradeId: 'invalid-trade-id',
      amount: '1',
      description: 'test fund move',
      checkNumber: tradeId,
      accountName: createdAchAccountId,
    };
    const { data } = await fundTrade(validTrade);
    expect(data.statusDesc).toEqual('Trade Account does not exist');
    expect(data.statusCode).toEqual('188');
  });
  it('fundTrade (externalFundMove) -- invalid wire trade', async () => {
    const validTrade = {
      accountId,
      offeringId,
      tradeId: wireTradeId,
      amount: '1',
      description: 'test fund move',
      checkNumber: tradeId,
      accountName: createdAchAccountId,
    };
    const { data } = await fundTrade(validTrade);
    expect(data.statusDesc).toEqual('Trade Id you entered is not an ACH trade');
    expect(data.statusCode).toEqual('194');
  });
  it('fundTrade (externalFundMove)', async () => {
    const validTrade = {
      accountId,
      offeringId,
      tradeId,
      amount: '1',
      description: 'test fund move',
      checkNumber: tradeId,
      accountName: createdAchAccountId,
    };
    const { data } = await fundTrade(validTrade);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [transferDetails] = data.TradeFinancialDetails;
    expect(transferDetails).toStrictEqual({
      accountId,
      RefNum: expect.any(String),
      fundStatus: 'Pending',
      notes: '',
      offeringId,
      tradeId,
      totalAmount: '1.000000',
      transactionstatus: 'Pending',
    });
    testReferenceNumber = transferDetails.RefNum;
  });
  it('getAchTransfer (getExternalFundMove) -- reference number missing', async () => {
    const { data } = await getAchTransfer({ accountId });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchTransfer (getExternalFundMove) -- account ID missing', async () => {
    const { data } = await getAchTransfer({
      RefNum: testReferenceNumber,
    });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchTransfer (getExternalFundMove) -- invalid account ID', async () => {
    const { data } = await getAchTransfer({
      RefNum: testReferenceNumber,
      accountId: 'invalid-account-id',
    });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
  });
  it('getAchTransfer (getExternalFundMove) -- invalid reference number', async () => {
    const { data } = await getAchTransfer({
      RefNum: 'invalid-reference-number',
      accountId,
    });
    expect(data.statusDesc).toEqual('No Tristate ACH record found.');
    expect(data.statusCode).toEqual('212');
  });
  it('getAchTransfer (getExternalFundMove)', async () => {
    const { data } = await getAchTransfer({
      RefNum: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: [
        {
          fundStatus: 'Pending',
          errors: '',
          accountId,
          tradeId,
          createdDate: expect.any(String),
          RefNum: testReferenceNumber,
          Bankname: null, // expected 'bank name',
          Accountfullname: 'account holder name',
          Accountnumber: btoa('12345'),
          Routingnumber: btoa('021000021'),
          offeringId,
          routingNumberStatus: 'Verified',
          totalAmount: '1.000000',
          transactionstatus: 'Pending',
        },
      ],
    });
  });
  it('getAchTransfer (getExternalFundMove) -- reference number alias (referenceNumber)', async () => {
    const { data } = await getAchTransfer({
      referenceNumber: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: [
        {
          fundStatus: 'Pending',
          errors: '',
          accountId,
          tradeId,
          createdDate: expect.any(String),
          RefNum: testReferenceNumber,
          Bankname: null, // expected 'bank name',
          Accountfullname: 'account holder name',
          Accountnumber: btoa('12345'),
          Routingnumber: btoa('021000021'),
          offeringId,
          routingNumberStatus: 'Verified',
          totalAmount: '1.000000',
          transactionstatus: 'Pending',
        },
      ],
    });
  });
  it('getAchTransfer (getExternalFundMove) -- reference number alias (refNum)', async () => {
    const { data } = await getAchTransfer({
      refNum: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: [
        {
          fundStatus: 'Pending',
          errors: '',
          accountId,
          tradeId,
          createdDate: expect.any(String),
          RefNum: testReferenceNumber,
          Bankname: null, // expected 'bank name',
          Accountfullname: 'account holder name',
          Accountnumber: btoa('12345'),
          Routingnumber: btoa('021000021'),
          offeringId,
          routingNumberStatus: 'Verified',
          totalAmount: '1.000000',
          transactionstatus: 'Pending',
        },
      ],
    });
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- reference number missing', async () => {
    const { data } = await getAchTransferInfo({ accountId });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- account ID missing', async () => {
    const { data } = await getAchTransferInfo({
      RefNum: testReferenceNumber,
    });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- invalid account ID', async () => {
    const { data } = await getAchTransferInfo({
      RefNum: testReferenceNumber,
      accountId: 'invalid-account-id',
    });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- invalid reference number', async () => {
    const { data } = await getAchTransferInfo({
      RefNum: 'invalid-reference-number',
      accountId,
    });
    expect(data.statusDesc).toEqual('No Tristate ACH record found.');
    expect(data.statusCode).toEqual('212');
  });
  it('getAchTransferInfo (getExternalFundMoveInfo)', async () => {
    const { data } = await getAchTransferInfo({
      RefNum: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: { fundStatus: 'Pending', error: '' },
      ACHDetails: {
        accountId,
        fundStatus: 'Pending',
        tradeId,
        createdDate: expect.any(String),
        developerAPIKey: process.env.TAPI_API_KEY,
        accountName: 'Test User',
        clientName: expect.any(String),
        clientId: process.env.TAPI_CLIENT_ID,
        issueName: 'Test issue',
      },
    });
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- reference number alias (referenceNumber)', async () => {
    const { data } = await getAchTransferInfo({
      referenceNumber: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: { fundStatus: 'Pending', error: '' },
      ACHDetails: {
        accountId,
        fundStatus: 'Pending',
        tradeId,
        createdDate: expect.any(String),
        developerAPIKey: process.env.TAPI_API_KEY,
        accountName: 'Test User',
        clientName: expect.any(String),
        clientId: process.env.TAPI_CLIENT_ID,
        issueName: 'Test issue',
      },
    });
  });
  it('getAchTransferInfo (getExternalFundMoveInfo) -- reference number alias (refNum)', async () => {
    const { data } = await getAchTransferInfo({
      refNum: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: { fundStatus: 'Pending', error: '' },
      ACHDetails: {
        accountId,
        fundStatus: 'Pending',
        tradeId,
        createdDate: expect.any(String),
        developerAPIKey: process.env.TAPI_API_KEY,
        accountName: 'Test User',
        clientName: expect.any(String),
        clientId: process.env.TAPI_CLIENT_ID,
        issueName: 'Test issue',
      },
    });
  });
  it('getAchTransferHistory (getExternalFundMoveHistory) -- account ID missing', async () => {
    const { data } = await getAchTransferHistory({});
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchTransferHistory (getExternalFundMoveHistory) -- invalid account ID', async () => {
    const { data } = await getAchTransferHistory({
      accountId: 'invalid-account-id',
    });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
  });
  it('getAchTransferHistory (getExternalFundMoveHistory)', async () => {
    const { data } = await getAchTransferHistory({
      accountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      accountDetails: expect.arrayContaining([
        expect.objectContaining({
          accountId,
          fundStatus: 'Pending',
          tradeId,
          Accountfullname: 'account holder name',
          transactionstatus: 'Pending',
          offeringId,
          RefNum: testReferenceNumber,
          totalAmount: '1.000000',
        }),
      ]),
    });
  });
  it('getAchAccount (getExternalAccount) -- account ID missing', async () => {
    const { data } = await getAchAccount({ type: 'Account' });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchAccount (getExternalAccount) -- account type typo', async () => {
    const { data } = await getAchAccount({ type: 'account', accountId });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('getAchAccount (getExternalAccount) -- account ID invalid', async () => {
    const { data } = await getAchAccount({ type: 'Account', accountId: 'invalid-account-id' });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
  });
  it('getAchAccount (getExternalAccount) -- no external account', async () => {
    const user = {
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data: account } = await accounts.createAccount(user);
    if (account.statusCode !== '101') throw account;
    const thisAccountId = account.accountDetails[0].accountId;
    const { data } = await getAchAccount({ type: 'Account', accountId: thisAccountId });
    expect(data.statusDesc).toEqual('Investor External Account does not exist / Nickname mismatch.');
    expect(data.statusCode).toEqual('149');
    accounts.deleteAccount(thisAccountId);
  });
  it('getAchAccount (getExternalAccount)', async () => {
    const { data } = await getAchAccount({ type: 'Account', accountId });
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      accountId,
      statusDesc: expect.objectContaining({
        AccountName: 'account holder name',
        AccountNickName: 'account name',
        AccountNumber: '12345',
        AccountRoutingNumber: '021000021',
        accountType: 'Checking',
      }),
    });
  });
  it('deleteAchAccount (deleteExternalAccount) -- account ID missing', async () => {
    const { data } = await deleteAchAccount({ type: 'Account' });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('deleteAchAccount (deleteExternalAccount) -- account type typo', async () => {
    const { data } = await deleteAchAccount({ type: 'account', accountId });
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('deleteAchAccount (deleteExternalAccount) -- account ID invalid', async () => {
    const { data } = await deleteAchAccount({ type: 'Account', accountId: 'invalid-account-id' });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
  });
  it('deleteAchAccount (deleteExternalAccount) -- no external account', async () => {
    const user = {
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data: account } = await accounts.createAccount(user);
    if (account.statusCode !== '101') throw account;
    const thisAccountId = account.accountDetails[0].accountId;
    const { data } = await deleteAchAccount({ type: 'Account', accountId: thisAccountId });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    // expect(data.statusDesc).toEqual('Investor External Account does not exist / Nickname mismatch.');
    // expect(data.statusCode).toEqual('149');
    accounts.deleteAccount(thisAccountId);
  });
  it('updateAchAccount (updateExternalAccount) -- missing required field (account holder)', async () => {
    const account = {
      type: 'account',
      accountId: 'accountId',
      accountName: 'account name',
      routingNumber: 'routing number',
      accountNumber: 'account number',
      bankName: 'bank name',
      updatedIpAddress: 'updated Ip address',
      accountType: 'checking',
    };
    expect(hasRequiredFields(account)).toBe(false);
    const { data } = await updateAchAccount(account);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data.statusCode).toEqual('106');
  });
  it('updateAchAccount (updateExternalAccount) -- invalid fields', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await updateAchAccount(invalidAccount);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data['']).toBe(null);
  });
  it('updateAchAccount (updateExternalAccount) -- invalid type and accountId', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await updateAchAccount({ ...invalidAccount, accountType: 'Checking' });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data['']).toBe(null);
  });
  it('updateAchAccount (updateExternalAccount) -- invalid accountType and accountId', async () => {
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await updateAchAccount({ ...invalidAccount, type: 'Account' });
    expect(data.statusDesc).toEqual('Account is not exist/active.');
    expect(data.statusCode).toEqual('148');
    expect(data['']).toBe(undefined);
    expect(data['External Account Details']).toBe(undefined);
  });
  it('updateAchAccount (updateExternalAccount) -- invalid accountType -- PASSES', async () => {
    // According to documentation this is invalid input
    const user = {
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data: account } = await accounts.createAccount(user);
    if (account.statusCode !== '101') throw account;
    const tempAccountId = account.accountDetails[0].accountId;
    expect(hasRequiredFields(invalidAccount)).toBe(true);
    const { data } = await updateAchAccount({
      ...invalidAccount,
      type: 'Account',
      accountType: 'invalid-account-type',
      accountId: tempAccountId,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['Account External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId: tempAccountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa(invalidAccount.accountNumber),
      ExtRoutingnumber: btoa(invalidAccount.routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
    await accounts.deleteAccount(tempAccountId);
  });
  it('updateAchAccount (updateExternalAccount) -- no change', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await updateAchAccount(validAccount(accountId));
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['Account External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa(validAccount(accountId).accountNumber),
      ExtRoutingnumber: btoa(validAccount(accountId).routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
  });
  it('updateAchAccount (updateExternalAccount) -- account number', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await updateAchAccount({ ...validAccount(accountId), accountNumber: '54321' });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['Account External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa('54321'),
      ExtRoutingnumber: btoa(validAccount(accountId).routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
  });
  it('updateAchAccount (updateExternalAccount) -- account holder name', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await updateAchAccount({ ...validAccount(accountId), accountHolderName: 'the account holder' });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['Account External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId,
      ExtAccountfullname: 'the account holder',
      ExtAccountnumber: btoa(validAccount(accountId).accountNumber),
      ExtRoutingnumber: btoa(validAccount(accountId).routingNumber),
      Extnickname: 'account name',
      accountType: 'Checking',
      types: 'Account',
    });
  });
  it('updateAchAccount (updateExternalAccount) -- nick name', async () => {
    expect(hasRequiredFields(validAccount(accountId))).toBe(true);
    const { data } = await updateAchAccount({ ...validAccount(accountId), accountName: 'new nickname' });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [accountDetails]] = data['Account External Account Details'];
    expect(accountDetails).toStrictEqual({
      accountId,
      ExtAccountfullname: 'account holder name',
      ExtAccountnumber: btoa(validAccount(accountId).accountNumber),
      ExtRoutingnumber: btoa(validAccount(accountId).routingNumber),
      Extnickname: 'new nickname',
      accountType: 'Checking',
      types: 'Account',
    });
  });
  it('voidAchTransfer (requestForVoidACH) -- reference number missing', async () => {
    const { data } = await voidAchTransfer({});
    expect(data.statusDesc).toEqual('Data/parameter missing');
    expect(data.statusCode).toEqual('106');
  });
  it('voidAchTransfer (requestForVoidACH) -- invalid reference number', async () => {
    const { data } = await voidAchTransfer({
      RefNum: 'invalid-reference-number',
    });
    expect(data.statusDesc).toEqual('No Tristate ACH record found.');
    expect(data.statusCode).toEqual('212');
  });
  it('voidAchTransfer (requestForVoidACH)', async () => {
    const { data } = await voidAchTransfer({
      RefNum: testReferenceNumber,
    });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      investorExternalAccountDetails: 'Status Updated Successfully',
    });
  });
  it('voidAchTransfer (requestForVoidACH) -- already void, reference number alias (referenceNumber)', async () => {
    const { data } = await voidAchTransfer({
      referenceNumber: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Tristate trade not in pending status.');
    expect(data.statusCode).toEqual('224');
    expect(data).toStrictEqual({
      statusCode: '224',
      statusDesc: 'Tristate trade not in pending status.',
    });
  });
  it('voidAchTransfer (requestForVoidACH) -- already void, reference number alias (refNum)', async () => {
    const { data } = await voidAchTransfer({
      refNum: testReferenceNumber,
      accountId,
    });
    expect(data.statusDesc).toEqual('Tristate trade not in pending status.');
    expect(data.statusCode).toEqual('224');
    expect(data).toStrictEqual({
      statusCode: '224',
      statusDesc: 'Tristate trade not in pending status.',
    });
  });
  it('deleteAchAccount (deleteExternalAccount)', async () => {
    const { data } = await deleteAchAccount({ type: 'Account', accountId });
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      'Account External Account Details': expect.arrayContaining([
        true,
        expect.arrayContaining([
          {
            accountId,
            Ext_status: 'Deleted',
          },
        ]),
      ]),
    });
  });
});
