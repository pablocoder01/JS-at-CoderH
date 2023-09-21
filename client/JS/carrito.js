let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const carritoCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");



function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        carritoCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    
    
        contenedorCarritoProductos.innerHTML = "";
    
        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");

            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Titulo</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                <small>Cantidad</small>
                <p id="carrito-contenedor-cantidadicon" class="carrito-contenedor-cantidadicon"><i id="carrito-cantidad-restar" class="bi bi-file-minus"></i>${producto.cantidad}<i id="carrito-cantidad-sumar" class="bi bi-file-plus"></i></p>
                    </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}" ><i class="bi bi-trash"></i></button>
            `;
            contenedorCarritoProductos.append(div);
            

            // `funcion para restar nueva`
            const decrease = div.querySelector(".bi-file-minus");
            decrease.addEventListener("click", () => {
                if(producto.cantidad !== 1){
                    producto.cantidad--;
                    cargarProductosCarrito();  
                }
            });

            const increse = div.querySelector(".bi-file-plus");
            increse.addEventListener("click", () => {
                producto.cantidad++;
                cargarProductosCarrito();  
        });
    });
        

    } else {
    
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        carritoCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
actualizarBotonesEliminar();
actualizarTotal();
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: false,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#e2e2e2",
            color: "#000000",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem', // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: '1.5rem' // vertical axis - can be a number or a string indicating unity. eg: '2em'
          },
        onClick: function(){} // Callback after click
      }).showToast();
    let idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();
    
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

}

botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {
    Swal.fire({
        title: '¿Estas seguro?',
        icon: 'question',
        html:
          `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:'Si',
        cancelButtonText:'No',
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
      })

    
}



function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);

    total.innerHTML = `
    <div>$${totalCalculado}</div>
    `;
}

// --------------------------------mp;
const mercadopago = new MercadoPago("TEST-77e28bad-2125-4f64-a0ba-662434eb06a4", {
    locale: "es-AR", // The most common are: 'pt-BR', 'es-AR' and 'en-US'
});

contenedorCarritoComprado.addEventListener("click", function () {
    contenedorCarritoComprado.remove();

const orderData = {
    quantity: 1,
    description: "compra de ecommerce",
    price: totalCalculado,
};

fetch("http://localhost:8080/create_preference", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
})
.then(function (response) {
    return response.json();
})
.then(function (preference) {
    createContenedorCarritoComprado(preference.id);
})
.catch(function () {
    alert("Unexpected error");
});
});



function createContenedorCarritoComprado(preferenceid) {
// Initialize the checkout
const bricksBuilder = mercadopago.bricks();

const renderComponent = async (bricksBuilder) => {
    //if (window.checkoutButton) checkoutButton.unmount();

    await bricksBuilder.create(
        "wallet",
        "contenedorCarritoComprado", // class/id where the payment button will be displayed
        {
            initialization: {
                preferenceId: preferenceid,
            },
            callbacks: {
                onError: (error) => console.error(error),
                onReady: () => {},
            },
        }
    );
};
window.contenedorCarritoComprado = renderComponent(bricksBuilder);
}

//----------------------------------- hasta aca




function comprarCarrito() {

    

    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        carritoCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.remove("disabled");
    
}