const user = requireAuth();
renderSidebar('payments.html');

const WALLET_PROVIDERS = ['ZainCash','AsiaHawala','FastPay','NassWallet','Other'];

function renderWallets() {
  const wallets = walletsGetAll();
  document.getElementById('wallet-table').innerHTML = wallets.length
    ? wallets.map(w => `<tr>
        <td><span class="badge badge-success">${w.provider}</span></td>
        <td class="fw-600">${w.accountName}</td>
        <td style="font-family:monospace">${w.number}</td>
        <td class="text-muted">${w.notes||'—'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openWalletForm('${w.id}')"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
            <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteWallet('${w.id}','${w.provider}')"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>`).join('')
    : emptyRow(5);
}

function renderBanks() {
  const banks = banksGetAll();
  document.getElementById('bank-table').innerHTML = banks.length
    ? banks.map(b => `<tr>
        <td class="fw-600">${b.bank}</td>
        <td>${b.accountName}</td>
        <td style="font-family:monospace;font-size:.82rem">${b.iban}</td>
        <td class="text-muted">${b.branch||'—'}</td>
        <td><span class="badge badge-primary">${b.currency}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openBankForm('${b.id}')"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
            <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteBank('${b.id}','${b.bank}')"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>`).join('')
    : emptyRow(6);
}

function openWalletForm(id = null) {
  const w = id ? walletsGetAll().find(x => x.id === id) : {};
  const html = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-mobile-screen text-primary" aria-hidden="true"></i> ${id?'Edit':'Add'} Wallet</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="wallet-form">
          <div class="form-group">
            <label>Provider *</label>
            <select name="provider">
              ${WALLET_PROVIDERS.map(p=>`<option ${(w.provider||'')===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Account Name *</label>
            <input type="text" name="accountName" value="${w.accountName||''}" required>
          </div>
          <div class="form-group">
            <label>Wallet Number *</label>
            <input type="tel" name="number" value="${w.number||''}" required>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea name="notes">${w.notes||''}</textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveWallet('${id||''}')"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save</button>
      </div>
    </div>`;
  openModal(html);
}

function saveWallet(id) {
  const fd = new FormData(document.getElementById('wallet-form'));
  const data = Object.fromEntries(fd.entries());
  data.id = id || '';
  if (!data.accountName || !data.number) { toast('Account name and number are required.', 'error'); return; }
  walletSave(data);
  closeModal();
  toast(id ? 'Wallet updated.' : 'Wallet added.');
  renderWallets();
}

function deleteWallet(id, name) {
  confirmDialog(`Delete <strong>${name}</strong> wallet?`, () => {
    walletDelete(id);
    toast('Wallet deleted.', 'warning');
    renderWallets();
  });
}

function openBankForm(id = null) {
  const b = id ? banksGetAll().find(x => x.id === id) : {};
  const html = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-building-columns text-primary" aria-hidden="true"></i> ${id?'Edit':'Add'} Bank Account</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="bank-form">
          <div class="form-row">
            <div class="form-group">
              <label>Bank Name *</label>
              <input type="text" name="bank" value="${b.bank||''}" required>
            </div>
            <div class="form-group">
              <label>Currency</label>
              <select name="currency">
                <option ${(b.currency||'IQD')==='IQD'?'selected':''}>IQD</option>
                <option ${(b.currency||'')==='USD'?'selected':''}>USD</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Account Name *</label>
            <input type="text" name="accountName" value="${b.accountName||''}" required>
          </div>
          <div class="form-group">
            <label>IBAN / Account Number *</label>
            <input type="text" name="iban" value="${b.iban||''}" required>
          </div>
          <div class="form-group">
            <label>Branch</label>
            <input type="text" name="branch" value="${b.branch||''}">
          </div>
          <div class="form-group">
            <label>Transfer Instructions</label>
            <textarea name="instructions">${b.instructions||''}</textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveBank('${id||''}')"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save</button>
      </div>
    </div>`;
  openModal(html);
}

function saveBank(id) {
  const fd = new FormData(document.getElementById('bank-form'));
  const data = Object.fromEntries(fd.entries());
  data.id = id || '';
  if (!data.bank || !data.accountName || !data.iban) { toast('Bank, account name and IBAN are required.', 'error'); return; }
  bankSave(data);
  closeModal();
  toast(id ? 'Bank account updated.' : 'Bank account added.');
  renderBanks();
}

function deleteBank(id, name) {
  confirmDialog(`Delete <strong>${name}</strong> account?`, () => {
    bankDelete(id);
    toast('Bank account deleted.', 'warning');
    renderBanks();
  });
}

renderWallets();
renderBanks();
