// Lógica JavaScript (Simulación de un archivo script.js)

const APP_NAME = "Seguro tu Plata";
const COMMISSION_RATE = 0.10; // 10%
let userBalance = 500000; // Saldo inicial simulado: $500,000 COP
let transactions = [
    { type: 'Depósito', amount: 500000, date: '2024-01-01', fee: 0, id: 1 },
]; // Historial de transacciones

/**
 * Función para cambiar la pantalla activa
 * @param {string} screenId - ID del <section> a mostrar
 */
function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Si vamos al Dashboard, actualizamos el saldo
    if (screenId === 'dashboard-screen') {
        updateDashboard();
    }
    // Si vamos a Retirar, actualizamos el saldo disponible
    if (screenId === 'retirar-screen') {
        document.getElementById('available-balance-retiro').textContent = formatCurrency(userBalance);
        // Limpiar el formulario y el display de comisión al entrar
        document.getElementById('monto-retiro').value = '';
        document.getElementById('fee-display').textContent = formatCurrency(0);
        document.getElementById('total-debit-display').textContent = formatCurrency(0);
    }
}

/**
 * Formatea un número a la moneda local (COP).
 * @param {number} amount - El valor numérico.
 * @returns {string} - El valor formateado.
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

/**
 * Actualiza la información del Dashboard.
 */
function updateDashboard() {
    // 1. Saldo actual
    document.getElementById('current-balance').textContent = formatCurrency(userBalance);
    
    // 2. Movimientos Recientes (solo los últimos 3)
    const recentList = document.getElementById('recent-movements-list');
    recentList.innerHTML = ''; // Limpiar lista
    
    const recentTxns = transactions.slice(-3).reverse(); // Últimos 3, en orden descendente
    
    if (recentTxns.length === 0) {
        recentList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No hay movimientos recientes.</p>';
        return;
    }

    recentTxns.forEach(txn => {
        const item = document.createElement('div');
        const sign = txn.type === 'Depósito' ? '+' : '-';
        const color = txn.type === 'Depósito' ? 'var(--color-success)' : 'var(--color-danger)';

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee;">
                <div>
                    <p style="font-weight: 600;">${txn.type}</p>
                    <small style="color: #666;">${new Date(txn.date).toLocaleDateString()}</small>
                </div>
                <span style="color: ${color}; font-weight: 600;">${sign} ${formatCurrency(txn.amount)}</span>
            </div>
        `;
        recentList.appendChild(item);
    });

    // 3. Actualizar lista completa de movimientos
    updateFullMovementsList();
}

/**
 * Actualiza la lista completa en la pantalla de Movimientos.
 */
function updateFullMovementsList() {
    const fullList = document.getElementById('full-movements-list');
    fullList.innerHTML = ''; // Limpiar lista

    // Iterar en orden inverso para que el más reciente esté arriba
    transactions.slice().reverse().forEach(txn => {
        const sign = txn.type === 'Depósito' ? '+' : '-';
        const color = txn.type === 'Depósito' ? 'var(--color-success)' : 'var(--color-danger)';
        const feeDisplay = txn.fee > 0 ? `<small style="color: var(--color-danger);">Comisión: ${formatCurrency(txn.fee)}</small>` : '';

        const li = document.createElement('li');
        li.style.cssText = 'padding: 15px; border-bottom: 1px solid #eee;';
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <p style="font-weight: 600;">${txn.type} ${txn.type !== 'Depósito' ? `(${formatCurrency(txn.amount)})` : ''}</p>
                    <small style="color: #666;">${new Date(txn.date).toLocaleDateString()} - ID: ${txn.id}</small>
                    ${feeDisplay}
                </div>
                <span style="color: ${color}; font-weight: 600; align-self: center;">
                    ${sign} ${formatCurrency(txn.type === 'Depósito' ? txn.amount : (txn.amount + txn.fee))}
                </span>
            </div>
        `;
        fullList.appendChild(li);
    });
}

// --- EVENT LISTENERS ---

// 1. Lógica de Login (simulada)
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const celular = document.getElementById('celular').value;
    const password = document.getElementById('password').value;

    // Validación mínima de formato (Client-side validation)
    if (celular.length !== 10 || password.length < 8) {
        alert('⚠️ Error de validación: Revise el celular (10 dígitos) y la contraseña (mín. 8 caracteres).');
        return;
    }
    
    // Simulación de autenticación exitosa (en producción se haría en el backend)
    console.log(`Intentando ingresar con ${celular}`);
    showScreen('dashboard-screen');
});

// 2. Lógica de Retiro y Cálculo de Comisión
const montoRetiroInput = document.getElementById('monto-retiro');

montoRetiroInput.addEventListener('input', function() {
    const monto = parseFloat(this.value) || 0;

    // a. Calcular Comisión (10%)
    const commission = monto * COMMISSION_RATE;
    const totalDebit = monto + commission;

    // b. Actualizar display
    document.getElementById('fee-display').textContent = formatCurrency(commission);
    document.getElementById('total-debit-display').textContent = formatCurrency(totalDebit);
});

// 3. Confirmación de Retiro
document.getElementById('retirar-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const monto = parseFloat(montoRetiroInput.value);
    const commission = monto * COMMISSION_RATE;
    const totalDebit = monto + commission;

    // Validación de Saldo
    if (totalDebit > userBalance) {
        alert('⛔ Saldo insuficiente. El total a debitar (Monto + Comisión) excede tu saldo.');
        return;
    }
    
    if (monto <= 0) {
        alert('⛔ El monto a retirar debe ser mayor a cero.');
        return;
    }

    if (confirm(`💸 ¿Deseas confirmar el retiro de ${formatCurrency(monto)}? Se debitará un total de ${formatCurrency(totalDebit)} (incluye comisión).`)) {
        // Ejecución de la Transacción
        userBalance -= totalDebit;

        // Registro de la transacción
        const newTxn = {
            type: 'Retiro',
            amount: monto,
            date: new Date().toISOString(),
            fee: commission,
            id: transactions.length + 1
        };
        transactions.push(newTxn);
        
        // Mostrar comprobante digital (alerta simple en este caso)
        alert(`✅ Retiro Exitoso!\nMonto Retirado: ${formatCurrency(monto)}\nComisión: ${formatCurrency(commission)}\nNuevo Saldo: ${formatCurrency(userBalance)}`);
        
        // Volver al dashboard y actualizar
        showScreen('dashboard-screen');
    }
});

// Inicialización: Muestra la pantalla de login/registro al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Si deseas iniciar directamente en el dashboard para pruebas, usa:
    // showScreen('dashboard-screen');
    // De lo contrario, la línea de arriba en HTML mantiene activa la de login
    updateDashboard(); // Carga la data inicial si se saltara el login
});
