// Configuração
const ADMIN_PASSWORD = 'admin2026'; // Altere esta senha
let isAdminLoggedIn = false;
let membersDatabase = [];

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    await loadMembersFromStorage();
    updateMemberCount();
});

// Alternar entre modos
function showMode(mode) {
    const modes = document.querySelectorAll('.mode-content');
    modes.forEach(m => m.classList.remove('active'));
    
    if (mode === 'member') {
        document.getElementById('memberMode').classList.add('active');
    } else {
        document.getElementById('adminMode').classList.add('active');
        if (isAdminLoggedIn) {
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            displayMembers();
        }
    }
}

// Login Admin
function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        displayMembers();
        showNotification('✅ Login realizado com sucesso!', 'success');
    } else {
        showNotification('❌ Senha incorreta!', 'error');
        document.getElementById('adminPassword').value = '';
    }
}

// Logout Admin
function logout() {
    isAdminLoggedIn = false;
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    showNotification('🚪 Logout realizado', 'success');
}

// Envio do formulário
document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoading(true);
    
    const formData = new FormData(e.target);
    const memberData = {
        id: Date.now(),
        dataCadastro: new Date().toISOString(),
        nome: formData.get('nome'),
        endereco: formData.get('endereco'),
        cidade: formData.get('cidade'),
        pais: formData.get('pais'),
        cep: formData.get('cep'),
        celular: formData.get('celular'),
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        dataNascimento: formData.get('dataNascimento'),
        naturalidade: formData.get('naturalidade'),
        sexo: formData.get('sexo'),
        estadoCivil: formData.get('estadoCivil'),
        nomeConjuge: formData.get('nomeConjuge'),
        dataCasamento: formData.get('dataCasamento'),
        rg: formData.get('rg'),
        escolaridade: formData.get('escolaridade'),
        profissao: formData.get('profissao'),
        nomePai: formData.get('nomePai'),
        nomeMae: formData.get('nomeMae'),
        tipoMembro: formData.get('tipoMembro'),
        cargo: formData.get('cargo'),
        dataBatismo: formData.get('dataBatismo'),
        pastorBatismo: formData.get('pastorBatismo'),
        igrejaBatismo: formData.get('igrejaBatismo'),
        dataProfissao: formData.get('dataProfissao'),
        pastorProfissao: formData.get('pastorProfissao'),
        igrejaProfissao: formData.get('igrejaProfissao'),
        consentimento: formData.get('consentimento') === 'on'
    };
    
    try {
        // Salvar no armazenamento compartilhado
        await saveMemberToStorage(memberData);
        
        showLoading(false);
        showNotification('✅ Cadastro enviado com sucesso! Obrigado por preencher seus dados.', 'success');
        
        // Limpar formulário
        e.target.reset();
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        showLoading(false);
        showNotification('❌ Erro ao enviar cadastro. Tente novamente.', 'error');
        console.error('Erro:', error);
    }
});

// Salvar membro no storage compartilhado
async function saveMemberToStorage(memberData) {
    try {
        // Adicionar à lista local
        membersDatabase.push(memberData);
        
        // Salvar no storage compartilhado
        const storageData = JSON.stringify(membersDatabase);
        await window.storage.set('uph_members_database', storageData, true);
        
        updateMemberCount();
        return true;
    } catch (error) {
        console.error('Erro ao salvar:', error);
        throw error;
    }
}

// Carregar membros do storage
async function loadMembersFromStorage() {
    try {
        const result = await window.storage.get('uph_members_database', true);
        if (result && result.value) {
            membersDatabase = JSON.parse(result.value);
        }
    } catch (error) {
        console.log('Nenhum dado encontrado ainda');
        membersDatabase = [];
    }
}

// Exibir membros (apenas para admin)
function displayMembers() {
    const membersList = document.getElementById('membersList');
    
    if (membersDatabase.length === 0) {
        membersList.innerHTML = `
            <div class="empty-state">
                <h3>📋 Nenhum membro cadastrado ainda</h3>
                <p>Os cadastros enviados pelos membros aparecerão aqui.</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por data de cadastro (mais recentes primeiro)
    const sortedMembers = [...membersDatabase].sort((a, b) => 
        new Date(b.dataCadastro) - new Date(a.dataCadastro)
    );
    
    membersList.innerHTML = sortedMembers.map(member => `
        <div class="member-card" data-id="${member.id}">
            <div class="member-header">
                <div class="member-name">${member.nome}</div>
                <button class="btn-delete" onclick="deleteMember(${member.id})">🗑️ Excluir</button>
            </div>
            <div class="member-details">
                <div class="member-detail">
                    <strong>📧 Email:</strong> ${member.email}
                </div>
                <div class="member-detail">
                    <strong>📱 Celular:</strong> ${member.celular}
                </div>
                <div class="member-detail">
                    <strong>☎️ Telefone:</strong> ${member.telefone || 'Não informado'}
                </div>
                <div class="member-detail">
                    <strong>🎂 Nascimento:</strong> ${formatDate(member.dataNascimento)}
                </div>
                <div class="member-detail">
                    <strong>📍 Cidade:</strong> ${member.cidade}
                </div>
                <div class="member-detail">
                    <strong>👤 Sexo:</strong> ${member.sexo}
                </div>
                <div class="member-detail">
                    <strong>💼 Profissão:</strong> ${member.profissao || 'Não informado'}
                </div>
                <div class="member-detail">
                    <strong>⛪ Tipo:</strong> ${member.tipoMembro}
                </div>
                <div class="member-detail">
                    <strong>🎖️ Cargo:</strong> ${member.cargo || 'Não informado'}
                </div>
                <div class="member-detail">
                    <strong>📅 Cadastrado em:</strong> ${new Date(member.dataCadastro).toLocaleString('pt-BR')}
                </div>
            </div>
        </div>
    `).join('');
}

// Filtrar membros
function filterMembers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const memberCards = document.querySelectorAll('.member-card');
    
    memberCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Excluir membro
async function deleteMember(id) {
    if (!confirm('❌ Tem certeza que deseja excluir este membro?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        membersDatabase = membersDatabase.filter(member => member.id !== id);
        
        // Atualizar storage
        const storageData = JSON.stringify(membersDatabase);
        await window.storage.set('uph_members_database', storageData, true);
        
        displayMembers();
        updateMemberCount();
        showLoading(false);
        showNotification('🗑️ Membro excluído com sucesso!', 'success');
    } catch (error) {
        showLoading(false);
        showNotification('❌ Erro ao excluir membro', 'error');
    }
}

// Exportar para Excel
function exportToExcel() {
    if (membersDatabase.length === 0) {
        alert('⚠️ Não há membros cadastrados para exportar!');
        return;
    }
    
    // Preparar dados
    const exportData = membersDatabase.map(member => ({
        'Nome': member.nome,
        'Email': member.email,
        'Celular': member.celular,
        'Telefone': member.telefone || '',
        'Data Nascimento': formatDate(member.dataNascimento),
        'Naturalidade': member.naturalidade || '',
        'Sexo': member.sexo,
        'Endereço': member.endereco,
        'Cidade/UF': member.cidade,
        'País': member.pais,
        'CEP': member.cep || '',
        'Estado Civil': member.estadoCivil || '',
        'Nome Cônjuge': member.nomeConjuge || '',
        'Data Casamento': member.dataCasamento ? formatDate(member.dataCasamento) : '',
        'RG': member.rg || '',
        'Escolaridade': member.escolaridade || '',
        'Profissão': member.profissao || '',
        'Nome Pai': member.nomePai || '',
        'Nome Mãe': member.nomeMae || '',
        'Tipo Membro': member.tipoMembro,
        'Cargo': member.cargo || '',
        'Data Batismo': member.dataBatismo ? formatDate(member.dataBatismo) : '',
        'Pastor Batismo': member.pastorBatismo || '',
        'Igreja Batismo': member.igrejaBatismo || '',
        'Data Profissão Fé': member.dataProfissao ? formatDate(member.dataProfissao) : '',
        'Pastor Profissão Fé': member.pastorProfissao || '',
        'Igreja Profissão Fé': member.igrejaProfissao || '',
        'Data Cadastro': new Date(member.dataCadastro).toLocaleString('pt-BR')
    }));
    
    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Membros UPH");
    
    // Largura das colunas
    ws['!cols'] = Array(28).fill({ wch: 20 });
    
    // Baixar arquivo
    const fileName = `membros_uph_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showNotification('📥 Planilha exportada com sucesso!', 'success');
}

// Atualizar contador
function updateMemberCount() {
    const counter = document.getElementById('totalMembros');
    if (counter) {
        counter.textContent = membersDatabase.length;
    }
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Máscaras para inputs
document.getElementById('celular').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        e.target.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        e.target.value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        e.target.value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
        e.target.value = value;
    }
});

document.getElementById('telefone').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length > 6) {
        e.target.value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        e.target.value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else {
        e.target.value = value;
    }
});

document.getElementById('cep').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length > 5) {
        e.target.value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    } else {
        e.target.value = value;
    }
});