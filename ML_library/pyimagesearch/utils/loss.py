import keras.backend as K
import tensorflow as tf
import numpy as np


num_samples = np.array([74874,
 134416,
 25459,
 14090,
 6378,
 3803,
 24882,
 3750, 
 ])

num_min = min(num_samples)

num_samples  = num_min / num_samples
#num_samples  = num_samples / num_min

#num_samples  = num_samples / num_min
#num_samples = [num_samples for x in range(config.BATCH_SIZE)]
#print(num_samples))
def customLoss(yTrue, yPred):
    axis = -1
    #yPred /= tf.reduce_sum(yPred, axis, True)
    

    #_epsilon = tf.convert_to_tensor(y_pred, yPred.dtype.base_dtype)
    #yPred = tf.clip_by_value(yPred, _epsilon, 1. - _epsilon)
    #return - tf.reduce_sum(yTrue * tf.log(yPred), axis)
    #tf.tensordot()
    #yTrue = K.print_tensor(yTrue, message="y=true = ") 
    #yPred = K.print_tensor(yPred, message="y=true = ") 
                             
    #return K.categorical_crossentropy(yTrue, yPred)
                                       
    #a = tf.multiply(yTrue, tf.log(yPred))
    #yTrue = K.print_tensor(a, message="a=  ") 
    #yTrue = K.print_tensor(yTrue, message="yTrue = ") 
    #yTrue = K.print_tensor(yTrue, message="yPred = ") 
    #yTrue = K.print_tensor(tf.multiply(yTrue, num_samples), message="yPred = ") 
                                                               
    yPred = yPred / tf.reduce_sum(yPred, axis, True)
    yPred = K.clip(yPred, K.epsilon(), 1. - K.epsilon())
    return -tf.reduce_sum(tf.multiply( tf.multiply(yTrue, num_samples), tf.log(yPred)), axis)
                                                                                
                                                                                    #return -tf.reduce_sum(tf.multiply(yTrue, tf.log(yPred)), axis))

