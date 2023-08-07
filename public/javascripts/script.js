// const { response } = require("../../app");

//  const { response } = require("../../app");


function addToCart(proId){
    $.ajax({
        url:'/add_to_cart/'+proId, //proId passed with url
        method:'get',
        success:(response)=>{ 
            if(response.status){
                let count=$('#cart_count').html() //#from cartCount span from userheader
                count=parseInt(count)+1;          //convert to integer+1
                $('#cart_count').html(count)
            }
        }
    })
}

function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    
    $.ajax({
        url:'/change_product_quantity',
        data:{
            cart:cartId,
            product:proId,
            user:userId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert('product removed from cart')
                location.reload() //reload page
            }else{
                document.getElementById(proId).innerHTML=quantity+count //tactic
                document.getElementById('total').innerHTML=response.total
            }
        }
    })
}
function removeItem(cartId,proId){
    $.ajax({
        url:'/remove_product',
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:()=>{
            
        }
    })
}; 

$(document).ready( function () {
    $('#productsTable').DataTable();
} );








    

