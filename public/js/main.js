$(document).ready(function(){
    $('.deleteNumber').on('click', deleteNumber);
});

function deleteNumber() {
    var conformation = confirm('are you sure?');
    if (conformation) {
        $.ajax({
           type: 'DELETE',
            url: '/numbers/delete/'+$(this).data('id')
        }).done(function(responce){
           window.location.href = '/';
        });
        window.location.href = '/';
    } else {
        return false;
    }
}

$(document).ready(function(){
    $('.deleteOperation').on('click', deleteOperation);
});

function deleteOperation() {
    var conformation = confirm('are you sure?');
    if (conformation) {
        $.ajax({
           type: 'DELETE',
            url: '/operations/delete/'+$(this).data('id')
        }).done(function(responce){
           window.location.href = '/';
        });
        window.location.href = '/';
    } else {
        return false;
    }
}