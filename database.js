const Database = {
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  apiKey: 'YOUR_API_KEY',
  clientId: 'YOUR_CLIENT_ID',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  data: {
    clientes: [],
    servicos: [],
    produtos: [],
    agendamentos: []
  },
  
  async init() {
    try {
      await this.loadGoogleApi();
      await this.authenticate();
      await this.loadFromGoogleSheets();
      setInterval(() => this.saveToGoogleSheets(), 300000);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  },

  async loadGoogleApi() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: this.apiKey,
              clientId: this.clientId,
              scope: this.scopes.join(' ')
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  },

  async authenticate() {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await gapi.auth2.getAuthInstance().signIn();
    }
  },

  async readSheet(range) {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: range
    });
    return response.result.values;
  },

  async writeSheet(range, values) {
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
    });
  },

  async loadFromGoogleSheets() {
    try {
      const clientesValues = await this.readSheet('Clientes!A2:Z');
      this.data.clientes = clientesValues.map(this.clienteFromRow);

      const servicosValues = await this.readSheet('Servicos!A2:Z');
      this.data.servicos = servicosValues.map(this.servicoFromRow);

      const produtosValues = await this.readSheet('Produtos!A2:Z');
      this.data.produtos = produtosValues.map(this.produtoFromRow);

      const agendamentosValues = await this.readSheet('Agendamentos!A2:Z');
      this.data.agendamentos = agendamentosValues.map(this.agendamentoFromRow);
    } catch (error) {
      console.error('Error loading data from Google Sheets:', error);
    }
  },

  async saveToGoogleSheets() {
    try {
      const clientesRows = this.data.clientes.map(this.clienteToRow);
      await this.writeSheet('Clientes!A2:Z', clientesRows);

      const servicosRows = this.data.servicos.map(this.servicoToRow);
      await this.writeSheet('Servicos!A2:Z', servicosRows);

      const produtosRows = this.data.produtos.map(this.produtoToRow);
      await this.writeSheet('Produtos!A2:Z', produtosRows);

      const agendamentosRows = this.data.agendamentos.map(this.agendamentoToRow);
      await this.writeSheet('Agendamentos!A2:Z', agendamentosRows);
    } catch (error) {
      console.error('Error saving data to Google Sheets:', error);
    }
  },

  async getClientes() {
    return this.data.clientes;
  },

  async addCliente(cliente) {
    cliente.id = Date.now().toString();
    this.data.clientes.push(cliente);
    await this.saveToGoogleSheets();
    return cliente;
  },

  async getCliente(id) {
    return this.data.clientes.find(c => c.id === id);
  },

  async updateCliente(id, cliente) {
    const index = this.data.clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.clientes[index] = { ...cliente, id };
      await this.saveToGoogleSheets();
    }
  },

  async deleteCliente(id) {
    this.data.clientes = this.data.clientes.filter(c => c.id !== id);
    await this.saveToGoogleSheets();
  },

  async getServicos() {
    return this.data.servicos;
  },

  async addServico(servico) {
    servico.id = Date.now().toString();
    this.data.servicos.push(servico);
    await this.saveToGoogleSheets();
    return servico;
  },

  async getServico(id) {
    return this.data.servicos.find(s => s.id === id);
  },

  async updateServico(id, servico) {
    const index = this.data.servicos.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.servicos[index] = { ...servico, id };
      await this.saveToGoogleSheets();
    }
  },

  async deleteServico(id) {
    this.data.servicos = this.data.servicos.filter(s => s.id !== id);
    await this.saveToGoogleSheets();
  },

  async getProdutos() {
    return this.data.produtos;
  },

  async addProduto(produto) {
    produto.id = Date.now().toString();
    this.data.produtos.push(produto);
    await this.saveToGoogleSheets();
    return produto;
  },

  async getProduto(id) {
    return this.data.produtos.find(p => p.id === id);
  },

  async updateProduto(id, produto) {
    const index = this.data.produtos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.produtos[index] = { ...produto, id };
      await this.saveToGoogleSheets();
    }
  },

  async deleteProduto(id) {
    this.data.produtos = this.data.produtos.filter(p => p.id !== id);
    await this.saveToGoogleSheets();
  },

  async getAgendamentos() {
    return this.data.agendamentos;
  },

  async addAgendamento(agendamento) {
    agendamento.id = Date.now().toString();
    this.data.agendamentos.push(agendamento);
    await this.saveToGoogleSheets();
    return agendamento;
  },

  async getAgendamento(id) {
    return this.data.agendamentos.find(a => a.id === id);
  },

  async updateAgendamento(id, agendamento) {
    const index = this.data.agendamentos.findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.agendamentos[index] = { ...agendamento, id };
      await this.saveToGoogleSheets();
    }
  },

  async deleteAgendamento(id) {
    this.data.agendamentos = this.data.agendamentos.filter(a => a.id !== id);
    await this.saveToGoogleSheets();
  },

  clienteFromRow(row) {
    return {
      id: row[0],
      nome: row[1],
      // ... map other fields
    };
  },

  clienteToRow(cliente) {
    return [
      cliente.id,
      cliente.nome,
      // ... map other fields
    ];
  },

  servicoFromRow(row) {
    return {
      id: row[0],
      nome: row[1],
      // ... map other fields
    };
  },

  servicoToRow(servico) {
    return [
      servico.id,
      servico.nome,
      // ... map other fields
    ];
  },

  produtoFromRow(row) {
    return {
      id: row[0],
      nome: row[1],
      // ... map other fields
    };
  },

  produtoToRow(produto) {
    return [
      produto.id,
      produto.nome,
      // ... map other fields
    ];
  },

  agendamentoFromRow(row) {
    return {
      id: row[0],
      data: row[1],
      // ... map other fields
    };
  },

  agendamentoToRow(agendamento) {
    return [
      agendamento.id,
      agendamento.data,
      // ... map other fields
    ];
  }
};

// Initialize database
Database.init().catch(console.error);

// Make Database available globally
window.Database = Database;