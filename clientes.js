const Clientes = {
  async loadClientes() {
    const clientesList = document.querySelector('.clients-list');
    if (!clientesList) return;

    try {
      const clientes = await Database.getClientes();
      this.renderClientes(clientes, clientesList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      clientesList.innerHTML = '<p class="error">Erro ao carregar clientes</p>';
    }
  },

  renderClientes(clientes, container) {
    container.innerHTML = `
      <div class="table">
        <div class="table-header">
          <div>Nome</div>
          <div>Telefone</div>
          <div>Email</div>
          <div>Ações</div>
        </div>
        ${clientes.map(cliente => `
          <div class="table-row">
            <div>${cliente.nome}</div>
            <div>${cliente.telefone}</div>
            <div>${cliente.email || '-'}</div>
            <div>
              <button class="icon-btn" onclick="Clientes.editarCliente('${cliente.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn" onclick="Clientes.excluirCliente('${cliente.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  showNovoClienteModal() {
    App.showModal(`
      <h2>Novo Cliente</h2>
      <form id="novo-cliente-form" onsubmit="Clientes.handleNovoCliente(event)">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="nome" required>
        </div>
        <div class="form-group">
          <label>Data de Nascimento</label>
          <input type="date" name="dataNascimento" required onchange="Clientes.checkAge(this)">
        </div>
        <div class="form-group">
          <label>Telefone</label>
          <input type="tel" name="telefone" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email">
        </div>
        
        <!-- Ficha de Anamnese -->
        <h3>Ficha de Anamnese</h3>
        <div class="form-group">
          <label>Possui problemas de saúde?</label>
          <select name="problemasSaude" onchange="Clientes.toggleField('problemasSaudeDesc')">
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
          <textarea name="problemasSaudeDesc" class="hidden" placeholder="Descreva os problemas de saúde"></textarea>
        </div>
        <div class="form-group">
          <label>Faz uso de medicamentos?</label>
          <select name="medicamentos" onchange="Clientes.toggleField('medicamentosDesc')">
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
          <textarea name="medicamentosDesc" class="hidden" placeholder="Liste os medicamentos"></textarea>
        </div>
        <div class="form-group">
          <label>Possui Alergias?</label>
          <select name="alergias" onchange="Clientes.toggleField('alergiasDesc')">
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
          <textarea name="alergiasDesc" class="hidden" placeholder="Descreva as alergias"></textarea>
        </div>
        <div class="form-group">
          <label>Gestante?</label>
          <select name="gestante">
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cirurgias recentes?</label>
          <select name="cirurgias" onchange="Clientes.toggleField('cirurgiasDesc')">
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
          <textarea name="cirurgiasDesc" class="hidden" placeholder="Descreva as cirurgias"></textarea>
        </div>
        <div class="form-group">
          <label>Observações adicionais</label>
          <textarea name="observacoes"></textarea>
        </div>

        <!-- Termos de Responsabilidade -->
        <h3>Termos de Responsabilidade</h3>
        <div id="termo-responsabilidade" class="form-group hidden">
          <label>
            <input type="checkbox" name="termoMenor" required>
            Declaro que sou responsável legal pelo menor e autorizo a realização dos procedimentos.
          </label>
          <div class="form-group">
            <label>Nome do Responsável</label>
            <input type="text" name="nomeResponsavel">
          </div>
          <div class="form-group">
            <label>CPF do Responsável</label>
            <input type="text" name="cpfResponsavel">
          </div>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" name="termoResultados" required>
            Declaro estar ciente que os resultados dos procedimentos podem variar de pessoa para pessoa
            e isento o espaço e a profissional de resultados indesejados, desde que seguidas todas as
            recomendações e boas práticas profissionais.
          </label>
        </div>

        <div class="modal-buttons">
          <button type="button" class="secondary-btn" onclick="App.closeModal()">Cancelar</button>
          <button type="submit" class="primary-btn">Salvar</button>
        </div>
      </form>
    `);
  },

  toggleField(fieldName) {
    const select = document.querySelector(`select[name="${fieldName.replace('Desc', '')}"]`);
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (select && field) {
      field.classList.toggle('hidden', select.value === 'nao');
      field.required = select.value === 'sim';
    }
  },

  checkAge(input) {
    const birthDate = new Date(input.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const termoResponsabilidade = document.getElementById('termo-responsabilidade');
    
    if (age < 18) {
      termoResponsabilidade.classList.remove('hidden');
      termoResponsabilidade.querySelectorAll('input').forEach(input => input.required = true);
    } else {
      termoResponsabilidade.classList.add('hidden');
      termoResponsabilidade.querySelectorAll('input').forEach(input => input.required = false);
    }
  },

  async handleNovoCliente(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const birthDate = new Date(formData.get('dataNascimento'));
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      const novoCliente = {
        nome: formData.get('nome'),
        dataNascimento: formData.get('dataNascimento'),
        idade: age,
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        anamnese: {
          problemasSaude: {
            possui: formData.get('problemasSaude') === 'sim',
            descricao: formData.get('problemasSaudeDesc') || ''
          },
          medicamentos: {
            possui: formData.get('medicamentos') === 'sim',
            descricao: formData.get('medicamentosDesc') || ''
          },
          alergias: {
            possui: formData.get('alergias') === 'sim',
            descricao: formData.get('alergiasDesc') || ''
          },
          gestante: formData.get('gestante') === 'sim',
          cirurgias: {
            possui: formData.get('cirurgias') === 'sim',
            descricao: formData.get('cirurgiasDesc') || ''
          },
          observacoes: formData.get('observacoes')
        },
        responsavel: age < 18 ? {
          nome: formData.get('nomeResponsavel'),
          cpf: formData.get('cpfResponsavel')
        } : null,
        termosAceitos: {
          resultados: formData.get('termoResultados') === 'on',
          menor: age < 18 ? formData.get('termoMenor') === 'on' : null
        },
        dataCadastro: new Date().toISOString()
      };

      await Database.addCliente(novoCliente);
      
      App.closeModal();
      await this.loadClientes();
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + error.message);
    }
  },

  async editarCliente(id) {
    try {
      const cliente = await Database.getCliente(id);

      App.showModal(`
        <h2>Editar Cliente</h2>
        <form id="editar-cliente-form" onsubmit="Clientes.handleEditarCliente(event, '${id}')">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" name="nome" value="${cliente.nome}" required>
          </div>
          <div class="form-group">
            <label>Data de Nascimento</label>
            <input type="date" name="dataNascimento" value="${cliente.dataNascimento}" required>
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="tel" name="telefone" value="${cliente.telefone}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" value="${cliente.email || ''}">
          </div>
          <div class="form-group">
            <label>Possui problemas de saúde?</label>
            <select name="problemasSaude" onchange="Clientes.toggleField('problemasSaudeDesc')">
              <option value="nao" ${!cliente.anamnese?.problemasSaude?.possui ? 'selected' : ''}>Não</option>
              <option value="sim" ${cliente.anamnese?.problemasSaude?.possui ? 'selected' : ''}>Sim</option>
            </select>
            <textarea name="problemasSaudeDesc" ${!cliente.anamnese?.problemasSaude?.possui ? 'class="hidden"' : ''} placeholder="Descreva os problemas de saúde">${cliente.anamnese?.problemasSaude?.descricao || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Faz uso de medicamentos?</label>
            <select name="medicamentos" onchange="Clientes.toggleField('medicamentosDesc')">
              <option value="nao" ${!cliente.anamnese?.medicamentos?.possui ? 'selected' : ''}>Não</option>
              <option value="sim" ${cliente.anamnese?.medicamentos?.possui ? 'selected' : ''}>Sim</option>
            </select>
            <textarea name="medicamentosDesc" ${!cliente.anamnese?.medicamentos?.possui ? 'class="hidden"' : ''} placeholder="Liste os medicamentos">${cliente.anamnese?.medicamentos?.descricao || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Possui Alergias?</label>
            <select name="alergias" onchange="Clientes.toggleField('alergiasDesc')">
              <option value="nao" ${!cliente.anamnese?.alergias?.possui ? 'selected' : ''}>Não</option>
              <option value="sim" ${cliente.anamnese?.alergias?.possui ? 'selected' : ''}>Sim</option>
            </select>
            <textarea name="alergiasDesc" ${!cliente.anamnese?.alergias?.possui ? 'class="hidden"' : ''} placeholder="Descreva as alergias">${cliente.anamnese?.alergias?.descricao || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Gestante?</label>
            <select name="gestante">
              <option value="nao" ${!cliente.anamnese?.gestante ? 'selected' : ''}>Não</option>
              <option value="sim" ${cliente.anamnese?.gestante ? 'selected' : ''}>Sim</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cirurgias recentes?</label>
            <select name="cirurgias" onchange="Clientes.toggleField('cirurgiasDesc')">
              <option value="nao" ${!cliente.anamnese?.cirurgias?.possui ? 'selected' : ''}>Não</option>
              <option value="sim" ${cliente.anamnese?.cirurgias?.possui ? 'selected' : ''}>Sim</option>
            </select>
            <textarea name="cirurgiasDesc" ${!cliente.anamnese?.cirurgias?.possui ? 'class="hidden"' : ''} placeholder="Descreva as cirurgias">${cliente.anamnese?.cirurgias?.descricao || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Observações adicionais</label>
            <textarea name="observacoes">${cliente.anamnese?.observacoes || ''}</textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" name="termoResultados" required ${cliente.termosAceitos?.resultados ? 'checked' : ''}>
              Declaro estar ciente que os resultados dos procedimentos podem variar de pessoa para pessoa
              e isento o espaço e a profissional de resultados indesejados, desde que seguidas todas as
              recomendações e boas práticas profissionais.
            </label>
          </div>
          ${cliente.idade < 18 ? `
            <div id="termo-responsabilidade" class="form-group">
              <label>
                <input type="checkbox" name="termoMenor" required ${cliente.termosAceitos?.menor ? 'checked' : ''}>
                Declaro que sou responsável legal pelo menor e autorizo a realização dos procedimentos.
              </label>
              <div class="form-group">
                <label>Nome do Responsável</label>
                <input type="text" name="nomeResponsavel" value="${cliente.responsavel?.nome || ''}">
              </div>
              <div class="form-group">
                <label>CPF do Responsável</label>
                <input type="text" name="cpfResponsavel" value="${cliente.responsavel?.cpf || ''}">
              </div>
            </div>
          ` : ''}
          <div class="modal-buttons">
            <button type="button" class="secondary-btn" onclick="App.closeModal()">Cancelar</button>
            <button type="submit" class="primary-btn">Salvar</button>
          </div>
        </form>
      `);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      alert('Erro ao carregar cliente: ' + error.message);
    }
  },

  async handleEditarCliente(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const birthDate = new Date(formData.get('dataNascimento'));
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      const clienteAtualizado = {
        nome: formData.get('nome'),
        dataNascimento: formData.get('dataNascimento'),
        idade: age,
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        anamnese: {
          problemasSaude: {
            possui: formData.get('problemasSaude') === 'sim',
            descricao: formData.get('problemasSaudeDesc') || ''
          },
          medicamentos: {
            possui: formData.get('medicamentos') === 'sim',
            descricao: formData.get('medicamentosDesc') || ''
          },
          alergias: {
            possui: formData.get('alergias') === 'sim',
            descricao: formData.get('alergiasDesc') || ''
          },
          gestante: formData.get('gestante') === 'sim',
          cirurgias: {
            possui: formData.get('cirurgias') === 'sim',
            descricao: formData.get('cirurgiasDesc') || ''
          },
          observacoes: formData.get('observacoes')
        },
        responsavel: age < 18 ? {
          nome: formData.get('nomeResponsavel'),
          cpf: formData.get('cpfResponsavel')
        } : null,
        termosAceitos: {
          resultados: formData.get('termoResultados') === 'on',
          menor: age < 18 ? formData.get('termoMenor') === 'on' : null
        },
        dataAtualizacao: new Date().toISOString()
      };

      await Database.updateCliente(id, clienteAtualizado);
      
      App.closeModal();
      await this.loadClientes();
      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente: ' + error.message);
    }
  },

  async excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await Database.deleteCliente(id);
        await this.loadClientes();
        alert('Cliente excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente: ' + error.message);
      }
    }
  }
};

window.Clientes = Clientes;