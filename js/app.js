/**
 * Waifu Random App
 * Generador de imágenes aleatorias usando API externa
 */

const CONFIG = {
    API_BASE: 'https://rezemd56-hash.github.io/Api-curv-V3',
    DEFAULT_TYPE: 'sfw',
    DEFAULT_CATEGORY: 'waifu'
};

// Elementos del DOM
const elements = {
    typeSelect: document.getElementById('type-select'),
    categorySelect: document.getElementById('category-select'),
    nsfwMsg: document.getElementById('nsfw-msg'),
    loading: document.getElementById('loading'),
    img: document.getElementById('waifu-img'),
    error: document.getElementById('error'),
    imageInfo: document.getElementById('image-info'),
    btnRandom: document.getElementById('btn-random'),
    btnCopy: document.getElementById('btn-copy')
};

/**
 * Inicializa la aplicación
 */
function init() {
    setupEventListeners();
    loadRandom();
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Cambio de tipo (SFW/NSFW)
    elements.typeSelect.addEventListener('change', handleTypeChange);
    
    // Botones
    elements.btnRandom.addEventListener('click', loadRandom);
    elements.btnCopy.addEventListener('click', copyUrl);
}

/**
 * Maneja el cambio entre SFW y NSFW
 */
function handleTypeChange() {
    const isNsfw = elements.typeSelect.value === 'nsfw';
    
    // Mostrar/ocultar advertencia
    elements.nsfwMsg.hidden = !isNsfw;
    
    // Mostrar/ocultar opción futa
    const futaOption = elements.categorySelect.querySelector('option[value="futa"]');
    if (futaOption) {
        futaOption.hidden = !isNsfw;
    }
    
    // Si está en futa y cambia a sfw, cambiar a waifu
    if (!isNsfw && elements.categorySelect.value === 'futa') {
        elements.categorySelect.value = 'waifu';
    }
}

/**
 * Carga una imagen aleatoria
 */
async function loadRandom() {
    const type = elements.typeSelect.value;
    const category = elements.categorySelect.value;
    
    showLoading();
    
    try {
        const data = await fetchImageData(type, category);
        const randomUrl = getRandomImage(data.images);
        await loadImage(randomUrl);
        
        elements.imageInfo.textContent = `${type.toUpperCase()} - ${category} (${data.count} total)`;
    } catch (err) {
        showError(err.message);
    }
}

/**
 * Obtiene los datos de la API
 */
async function fetchImageData(type, category) {
    const response = await fetch(`${CONFIG.API_BASE}/data/${type}-${category}.json`);
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.images || data.images.length === 0) {
        throw new Error('No hay imágenes disponibles');
    }
    
    return data;
}

/**
 * Selecciona una imagen aleatoria del array
 */
function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}

/**
 * Carga la imagen en el DOM
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        elements.img.onload = () => {
            elements.loading.hidden = true;
            elements.img.hidden = false;
            resolve();
        };
        
        elements.img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };
        
        elements.img.src = url;
    });
}

/**
 * Muestra estado de carga
 */
function showLoading() {
    elements.loading.hidden = false;
    elements.img.hidden = true;
    elements.error.hidden = true;
    elements.imageInfo.textContent = 'Cargando...';
}

/**
 * Muestra error
 */
function showError(message) {
    elements.loading.hidden = true;
    elements.img.hidden = true;
    elements.error.hidden = false;
    elements.error.textContent = `❌ ${message}`;
    elements.imageInfo.textContent = '';
}

/**
 * Copia la URL al portapapeles
 */
async function copyUrl() {
    if (!elements.img.src || elements.img.hidden) {
        return;
    }
    
    try {
        await navigator.clipboard.writeText(elements.img.src);
        showToast('¡URL copiada al portapapeles!');
    } catch (err) {
        showToast('Error al copiar', true);
    }
}

/**
 * Muestra un toast notification
 */
function showToast(message, isError = false) {
    // Crear toast
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ff4757' : '#4CAF50'};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 500;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remover después de 2 segundos
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
