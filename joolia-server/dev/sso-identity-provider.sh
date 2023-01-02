# NOTE:
# This  container image provides a preconfigured SAML2.0 Identity Provider.
# Check the link below for access credentials.
# https://hub.docker.com/r/kristophjunge/test-saml-idp/

docker run --name=testsamlidp_idp \
-p 8080:8080 \
-p 8443:8443 \
-e SIMPLESAMLPHP_SP_ENTITY_ID=http://app.example.com \
-e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:3000/sso/callback \
-e SIMPLESAMLPHP_SP_SINGLE_LOGOUT_SERVICE=http://localhost/simplesaml/module.php/saml/sp/saml2-logout.php/test-sp \
-d kristophjunge/test-saml-idp
