# Aaron Trujillo 10/28/19 atrujillo@g.hmc.edu
# this file is being used to test basic updating and pulling
# from our firebase database

from firebase import firebase
import config
# TODO -- need to add user authentication and fully implement the
# firebase connection to our program (allow for editing with rules
# activated)

# config is not necessary for now, but once we change our database
# settings, we will need it to be able to edit the database values
firebase_config = {
    "apiKey": config.apiKey,
    "authDomain": config.authDomain,
    "databaseURL": config.databaseURL,
    "storageBucket": config.storageBucket
}

firebase = firebase.FirebaseApplication(config.databaseURL)

firebase.put('/count', "value", 0)
count = firebase.get('/count/value', None)
print(count)
