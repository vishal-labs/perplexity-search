import pickle
from ML.featureExtraction import features

class Modelprediction():
    def predict(self, inp_str):
        text = inp_str
        ft = features()
        result = ft.analyze_string(text)
        model = pickle.load(open("ML/ForestClassifier.pickle.dat", "rb"))
        return model.predict([result])
    
