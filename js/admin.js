document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo para productos
    const products = [{
            id: 1,
            name: "Lavado Premium",
            description: "Lavado completo exterior e interior con cera y aspirado",
            price: 45.99,
            stock: 15,
            status: "active",
            categories: ["Lavado", "Encerado"],
            image: "img/products/premium.jpg"
        },
        {
            id: 2,
            name: "Lavado Básico",
            description: "Lavado exterior rápido con secado manual",
            price: 25.50,
            stock: 20,
            status: "active",
            categories: ["Lavado"],
            image: "img/products/basic.jpg"
        },
        {
            id: 3,
            name: "Encerado Profesional",
            description: "Aplicación de cera de alta duración para protección de pintura",
            price: 35.00,
            stock: 8,
            status: "active",
            categories: ["Encerado"],
            image: "img/products/wax.jpg"
        },
        {
            id: 4,
            name: "Aspirado Completo",
            description: "Aspirado profundo de tapicería y alfombras",
            price: 20.00,
            stock: 0,
            status: "inactive",
            categories: ["Aspirado"],
            image: "img/products/vacuum.jpg"
        },
        {
            id: 5,
            name: "Pulido de Faros",
            description: "Restauración y pulido de faros opacos",
            price: 30.00,
            stock: 5,
            status: "active",
            categories: ["Pulido"],
            image: "img/products/lights.jpg"
        }
    ];

    // Variables para paginación
    let currentPage = 1;
    const productsPerPage = 5;
    let filteredProducts = [...products];

    // Inicialización
    initAdminPanel();

    function initAdminPanel() {
        // Ajustar sidebar al cargar
        adjustSidebar();

        // Cargar productos
        loadProducts();

        // Configurar eventos
        setupEventListeners();
    }

    function adjustSidebar() {
        if (window.innerWidth >= 768) {
            const bsCollapse = new bootstrap.Collapse(document.getElementById('sidebar'), { toggle: false });
            bsCollapse.show();
        }
    }

    function setupEventListeners() {
        // Botón para agregar producto
        document.getElementById('add-product-btn').addEventListener('click', showAddProductModal);

        // Botón de búsqueda
        document.getElementById('search-product-btn').addEventListener('click', searchProducts);
        document.getElementById('product-search').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') searchProducts();
        });

        // Filtros
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                filterProducts(filter);
            });
        });

        // Ordenamiento
        document.querySelectorAll('[data-sort]').forEach(item => {
            item.addEventListener('click', function() {
                const sortOption = this.getAttribute('data-sort');
                sortProducts(sortOption);
            });
        });

        // Vista previa de imagen
        document.getElementById('productImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('imagePreview').src = event.target.result;
                    document.getElementById('imagePreviewContainer').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Guardar producto
        document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

        // Navegación entre secciones
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                changeSection(this);
            });
        });
    }

    function loadProducts(page = 1) {
        currentPage = page;
        const startIndex = (page - 1) * productsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';

        if (paginatedProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-box-open fa-2x mb-3"></i>
                        <p>No se encontraron productos</p>
                    </td>
                </tr>
            `;
            return;
        }

        paginatedProducts.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" class="product-img-table"></td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'} status-badge">
                        ${product.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Configurar eventos para los botones de editar/eliminar
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                editProduct(productId);
            });
        });

        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                deleteProduct(productId);
            });
        });

        // Actualizar paginación
        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const pagination = document.getElementById('products-pagination');
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) loadProducts(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', function(e) {
                e.preventDefault();
                loadProducts(i);
            });
            pagination.appendChild(pageLi);
        }

        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) loadProducts(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    function showAddProductModal() {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        document.getElementById('productForm').reset();
        document.getElementById('productModalLabel').textContent = 'Nuevo Producto';
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('productId').value = '';

        // Desmarcar todas las categorías
        document.querySelectorAll('.category-checkboxes input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        modal.show();
    }

    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        document.getElementById('productModalLabel').textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productStatus').checked = product.status === 'active';

        // Mostrar imagen actual
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreview');
        previewImg.src = product.image;
        previewContainer.style.display = 'block';

        // Marcar categorías
        document.querySelectorAll('.category-checkboxes input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = product.categories.includes(checkbox.value);
        });

        modal.show();
    }

    function saveProduct() {
        // Validar formulario
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Obtener datos del formulario
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            status: document.getElementById('productStatus').checked ? 'active' : 'inactive',
            categories: Array.from(document.querySelectorAll('.category-checkboxes input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value),
            image: document.getElementById('imagePreview').src || 'img/products/default.jpg'
        };

        // Guardar o actualizar producto
        if (productId) {
            // Actualizar producto existente
            const index = products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                products[index] = {...products[index], ...productData };
            }
        } else {
            // Agregar nuevo producto
            const newId = Math.max(...products.map(p => p.id)) + 1;
            products.push({
                id: newId,
                ...productData
            });
        }

        // Cerrar modal y recargar productos
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        loadProducts(currentPage);
    }

    function deleteProduct(productId) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products.splice(index, 1);
                loadProducts(currentPage);
            }
        }
    }

    function searchProducts() {
        const searchTerm = document.getElementById('product-search').value.toLowerCase();
        if (searchTerm) {
            filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        } else {
            filteredProducts = [...products];
        }
        loadProducts(1);
    }

    function filterProducts(filter) {
        if (filter === 'all') {
            filteredProducts = [...products];
        } else {
            filteredProducts = products.filter(product => product.status === filter);
        }
        loadProducts(1);
    }

    function sortProducts(sortOption) {
        const [field, order] = sortOption.split('-');

        filteredProducts.sort((a, b) => {
            if (field === 'name') {
                return order === 'asc' ?
                    a.name.localeCompare(b.name) :
                    b.name.localeCompare(a.name);
            } else if (field === 'price') {
                return order === 'asc' ?
                    a.price - b.price :
                    b.price - a.price;
            }
            return 0;
        });

        loadProducts(1);
    }

    function changeSection(clickedLink) {
        // Remover active de todos los enlaces
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));

        // Agregar active al clickeado
        clickedLink.classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección correspondiente
        const sectionId = clickedLink.getAttribute('data-section') + '-section';
        document.getElementById(sectionId).classList.add('active');

        // Actualizar título
        updateSectionTitle(clickedLink);
    }

    function updateSectionTitle(link) {
        const titleElement = document.getElementById('section-title');
        const text = link.querySelector('span') ? link.querySelector('span').textContent :
            link.querySelector('i').nextSibling.textContent.trim();
        titleElement.textContent = text;
    }
});