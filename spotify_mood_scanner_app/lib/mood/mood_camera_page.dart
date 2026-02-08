import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

import 'mood_estimator.dart';

class MoodCameraPage extends StatefulWidget {
  const MoodCameraPage({super.key});

  @override
  State<MoodCameraPage> createState() => _MoodCameraPageState();
}

class _MoodCameraPageState extends State<MoodCameraPage> {
  CameraController? _controller;
  FaceDetector? _faceDetector;
  final MoodEstimator _moodEstimator = MoodEstimator(alpha: 0.25);

  bool _isProcessing = false;
  int _frameSkip = 0;

  MoodReading _reading = MoodReading(Mood.unknown, 0.0, "");
  String _status = "Initializing...";

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  void dispose() {
    _stop();
    super.dispose();
  }

  Future<void> _init() async {
    // IMPORTANT: camera image streaming + ML Kit is not supported on Flutter Web in this approach.
    if (kIsWeb) {
      setState(() {
        _status = "Web build: use the Web webcam page (MediaPipe). This page is iOS-only.";
      });
      return;
    }

    try {
      final cameras = await availableCameras();
      final front = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _controller = CameraController(
        front,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.bgra8888, // best for iOS
      );

      await _controller!.initialize();

      _faceDetector = FaceDetector(
        options: FaceDetectorOptions(
          performanceMode: FaceDetectorMode.fast,
          enableClassification: true, // smile + eye open probabilities
          enableLandmarks: false,
          enableContours: false,
          enableTracking: false,
        ),
      );

      setState(() {
        _status = "Point the camera at your face";
      });

      // Some platforms don’t support image streaming; guard it.
      if (_controller!.value.isStreamingImages) return;
      if (!_controller!.value.isInitialized) return;

      // Camera plugin asserts if streaming unsupported, so only call on non-web (already guarded).
      await _controller!.startImageStream(_onCameraImage);
    } catch (e) {
      setState(() {
        _status = "Error initializing camera/ML: $e";
      });
    }
  }

  Future<void> _stop() async {
    try {
      await _controller?.stopImageStream();
    } catch (_) {}
    await _controller?.dispose();
    await _faceDetector?.close();
  }

  Future<void> _onCameraImage(CameraImage image) async {
    _frameSkip++;
    if (_frameSkip % 3 != 0) return; // reduce load

    if (_isProcessing || _faceDetector == null || _controller == null) return;
    _isProcessing = true;

    try {
      final inputImage = _cameraImageToInputImageBgra(image);
      final faces = await _faceDetector!.processImage(inputImage);

      if (faces.isEmpty) {
        setState(() {
          _reading = MoodReading(Mood.unknown, 0.0, "");
          _status = "No face detected";
        });
      } else {
        faces.sort((a, b) => _rectArea(b.boundingBox).compareTo(_rectArea(a.boundingBox)));
        final face = faces.first;

        final reading = _moodEstimator.estimateFromFace(face);

        setState(() {
          _reading = reading;
          _status = "Face detected";
        });
      }
    } catch (e) {
      setState(() {
        _status = "Processing error: $e";
      });
    } finally {
      _isProcessing = false;
    }
  }

  double _rectArea(Rect r) => (r.width > 0 ? r.width : 0) * (r.height > 0 ? r.height : 0);

  // iOS BGRA path (works when camera is set to bgra8888)
  InputImage _cameraImageToInputImageBgra(CameraImage image) {
    // For iOS BGRA8888, you should have exactly 1 plane
    final plane = image.planes.first;
    final bytes = plane.bytes;

    final metadata = InputImageMetadata(
      size: Size(image.width.toDouble(), image.height.toDouble()),
      rotation: InputImageRotation.rotation0deg,
      format: InputImageFormat.bgra8888,
      bytesPerRow: plane.bytesPerRow,
    );

    return InputImage.fromBytes(bytes: bytes, metadata: metadata);
  }

  String _moodToString(Mood mood) {
    switch (mood) {
      case Mood.happy:
        return "HAPPY";
      case Mood.calm:
        return "CALM";
      case Mood.focused:
        return "FOCUSED";
      case Mood.tired:
        return "TIRED";
      case Mood.neutral:
        return "NEUTRAL";
      case Mood.unknown:
        return "UNKNOWN";
    }
  }

  Color _backgroundForMood(Mood mood) {
    switch (mood) {
      case Mood.happy:
        return Colors.yellow.shade200;
      case Mood.calm:
        return Colors.blue.shade200;
      case Mood.focused:
        return Colors.purple.shade200;
      case Mood.tired:
        return Colors.grey.shade300;
      case Mood.neutral:
        return Colors.green.shade200;
      case Mood.unknown:
        return Colors.black12;
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

    return Scaffold(
      appBar: AppBar(title: const Text("Mood Scanner (iOS ML Kit)")),
      body: AnimatedContainer(
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
        color: _backgroundForMood(_reading.mood),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: controller == null || !controller.value.isInitialized
                    ? Center(child: Text(_status, textAlign: TextAlign.center))
                    : Stack(
                        children: [
                          CameraPreview(controller),
                          Positioned(
                            left: 16,
                            right: 16,
                            bottom: 16,
                            child: _Hud(
                              status: _status,
                              mood: _moodToString(_reading.mood),
                              confidence: _reading.confidence,
                              debug: _reading.debug,
                            ),
                          ),
                        ],
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        _moodEstimator.reset();
                        setState(() {
                          _reading = MoodReading(Mood.unknown, 0.0, "");
                          _status = "Reset smoothing";
                        });
                      },
                      child: const Text("Reset"),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        kIsWeb
                            ? "Web build: use MediaPipe page"
                            : "Mood updates from face (smile/eyes)",
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Hud extends StatelessWidget {
  final String status;
  final String mood;
  final double confidence;
  final String debug;

  const _Hud({
    required this.status,
    required this.mood,
    required this.confidence,
    required this.debug,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.55),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.white),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(status),
            const SizedBox(height: 6),
            Text(
              "Mood: $mood  (conf ${(confidence * 100).toStringAsFixed(0)}%)",
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            if (debug.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(debug, style: const TextStyle(fontSize: 12)),
            ],
          ],
        ),
      ),
    );
  }
}
