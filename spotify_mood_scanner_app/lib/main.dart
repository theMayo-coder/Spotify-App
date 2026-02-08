import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'mood/mood_camera_page.dart';
import 'package:spotify_mood_scanner_app/web/webcam_mood_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mood App',
      theme: ThemeData(useMaterial3: true),
      home: kIsWeb ? WebcamMoodPage() : MoodCameraPage(),
    );
  }
}
