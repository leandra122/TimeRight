// Global app functions
async function checkUserSession() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.success) {
            // User is logged in
            document.getElementById('auth-links').style.display = 'none';
            document.getElementById('user-menu').style.display = 'flex';
            document.getElementById('user-name').textContent = data.user.name;
        } else {
            // User is not logged in
            document.getElementById('auth-links').style.display = 'flex';
            document.getElementById('user-menu').style.display = 'none';
        }
    } catch (error) {
        // Error checking session
        document.getElementById('auth-links').style.display = 'flex';
        document.getElementById('user-menu').style.display = 'none';
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        window.location.href = '/';
    }
}

async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success) {
            const servicesGrid = document.getElementById('services-grid');
            if (servicesGrid) {
                const servicesHtml = data.data.slice(0, 3).map(service => `
                    <div class="service-card">
                        <h3>${service.title}</h3>
                        <div class="price">R$ ${service.price}</div>
                        <p>${service.description}</p>
                        <a href="/agendamento.html" class="btn btn-primary">Agendar</a>
                    </div>
                `).join('');
                
                servicesGrid.innerHTML = servicesHtml;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    loadServices();
});