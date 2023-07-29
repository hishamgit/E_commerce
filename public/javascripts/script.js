function addToCart(proId){
    $.ajax({
        url:'/add_to_cart/'+proId,
        method:'get',
        success:(response)=>{ 
            if(response.status){
                let count=$('#cart_count').html() //#from cartCount span from userheader
                count=parseInt(count)+1;
                $('#cart_count').html(count)
            }
        }
    })
}