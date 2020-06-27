Stripe.setPublishableKey('pk_test_51GwsYZLeFUkQE3wunwaVkuXxKBd6RiuvuXCSqeZ7fwv9SxfmQRs1jQDq1NpzePuozoV9ZweurS7MoOSXWcSPgPmw00NNpUK9q9');

var $form = $('#checkout-form');

$form.submit((event) => {
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        // name: $('#name').val(),
        // address_line1: $('#address').val()
      }, stripeResponseHandler);
      return false;
})

function stripeResponseHandler(status, response) {

    // Grab the form:
    // var $form = $('#payment-form');
  
    if (response.error) { // Problem!
  
      // Show the errors on the form
      $('#charge-error').text(response.error.message);
      $('#charge-error').removeClass('hidden');
      $('button').prop('disabled', false); // Re-enable submission
  
    } else { // Token was created!
  
      // Get the token ID:
      var token = response.id;
  
      // Insert the token into the form so it gets submitted to the server:
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
  
      // Submit the form:
      $form.get(0).submit();
      console.log('submitted')
  
    }
  }