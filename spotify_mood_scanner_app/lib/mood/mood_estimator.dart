import 'dart:math';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

enum Mood { happy, calm, focused, tired, neutral, unknown }

class MoodReading {
  final Mood mood;
  final double confidence; // 0..1
  final String debug; // helpful for tuning

  MoodReading(this.mood, this.confidence, this.debug);
}

/// Simple heuristic mood estimator (for iOS ML Kit pipeline).
class MoodEstimator {
  // Exponential smoothing so mood doesn't flicker frame-to-frame
  double _smileSmoothed = 0.0;
  double _eyeOpenSmoothed = 1.0;
  bool _initialized = false;

  final double alpha; // 0..1; higher = more responsive
  MoodEstimator({this.alpha = 0.25});

  MoodReading estimateFromFace(Face face) {
    final smile = face.smilingProbability;
    final le = face.leftEyeOpenProbability;
    final re = face.rightEyeOpenProbability;

    if (smile == null || le == null || re == null) {
      return MoodReading(Mood.unknown, 0.0, "No classification probs available");
    }

    final eyeOpen = (le + re) / 2.0;

    if (!_initialized) {
      _smileSmoothed = smile;
      _eyeOpenSmoothed = eyeOpen;
      _initialized = true;
    } else {
      _smileSmoothed = alpha * smile + (1 - alpha) * _smileSmoothed;
      _eyeOpenSmoothed = alpha * eyeOpen + (1 - alpha) * _eyeOpenSmoothed;
    }

    Mood mood;
    if (_smileSmoothed > 0.65) {
      mood = Mood.happy;
    } else if (_eyeOpenSmoothed < 0.35) {
      mood = Mood.tired;
    } else if (_smileSmoothed < 0.20 && _eyeOpenSmoothed > 0.75) {
      mood = Mood.focused;
    } else if (_smileSmoothed >= 0.20 && _smileSmoothed <= 0.45 && _eyeOpenSmoothed > 0.55) {
      mood = Mood.calm;
    } else {
      mood = Mood.neutral;
    }

    // Rough confidence: decisive smile or decisive tiredness
    final smileScore = (max(0, _smileSmoothed - 0.5) * 2).clamp(0.0, 1.0);
    final tiredScore = (max(0, 0.5 - _eyeOpenSmoothed) * 2).clamp(0.0, 1.0);
    final confidence = (max(smileScore, tiredScore) * 0.9 + 0.1).clamp(0.0, 1.0);

    final debug = "smile=${_smileSmoothed.toStringAsFixed(2)}, eyes=${_eyeOpenSmoothed.toStringAsFixed(2)}";

    return MoodReading(mood, confidence, debug);
  }

  void reset() {
    _initialized = false;
    _smileSmoothed = 0.0;
    _eyeOpenSmoothed = 1.0;
  }
}
