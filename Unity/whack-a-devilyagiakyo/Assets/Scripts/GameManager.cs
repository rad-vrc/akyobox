using System.Collections;
using System.Runtime.InteropServices;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    // WebGL用の外部JS関数定義
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void PlayTitleVideoJS();

    [DllImport("__Internal")]
    private static extern void PlayGameVideoJS();

    [DllImport("__Internal")]
    private static extern void PlayEndingVideoJS();

    [DllImport("__Internal")]
    private static extern void StopVideoJS();
#else
    // エディタでのエラー回避用ダミーメソッド
    private static void PlayTitleVideoJS() { Debug.Log("JS Call: PlayTitleVideo"); }
    private static void PlayGameVideoJS() { Debug.Log("JS Call: PlayGameVideo"); }
    private static void PlayEndingVideoJS() { Debug.Log("JS Call: PlayEndingVideo"); }
    private static void StopVideoJS() { Debug.Log("JS Call: StopVideo"); }
#endif

    public static GameManager Instance { get; private set; }

    private const string HighScoreKey = "HighScore";

    [SerializeField]
    private float gameDurationSeconds = 60f;

    [SerializeField]
    private AudioClip startSfx;

    [SerializeField]
    private AudioClip settingsOpenSfx;

    [SerializeField]
    private AudioClip settingsCloseSfx;

    [SerializeField]
    private AudioClip targetHitSfx;

    [SerializeField]
    private AudioClip decoyHitSfx;

    [SerializeField]
    private GameObject startScreen;

    [SerializeField]
    private GameObject gameScreen;

    [SerializeField]
    private GameObject settingsScreen;

    [SerializeField]
    private GameObject endingScreen;

    [SerializeField]
    private BGMController bgmController;

    [SerializeField]
    private AudioClip resultIntroSfx;

    [SerializeField]
    private GameObject resultIntroImage;

    [SerializeField]
    private GameObject postProcessVolume;

    [SerializeField, Range(0f, 1f)]
    private float initialSfxVolume = 1f;

    private float timeRemaining;
    private bool isPlaying;
    private bool isInSettings;
    private bool isInResult;
    private bool isInEnding;
    private int score;
    private int highScore;
    private float sfxVolume = 1f;

    [SerializeField]
    private AkyoSpawner spawner;

    private Coroutine returnToTitleCoroutine;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
    }

    private void Start()
    {
        Debug.Log("GameManager: Start called");
        isPlaying = false;
        isInSettings = false;
        isInResult = false;
        isInEnding = false;
        timeRemaining = gameDurationSeconds;
        score = 0;

        highScore = PlayerPrefs.GetInt(HighScoreKey, 0);
        sfxVolume = Mathf.Clamp01(initialSfxVolume);

        if (resultIntroImage != null)
        {
            resultIntroImage.SetActive(false);
        }

        UpdateScreenState();

        if (bgmController != null)
        {
            bgmController.PlayTitleBgm();
        }

        PlayTitleVideoJS();
    }

    private void Update()
    {
        if (!isPlaying)
        {
            return;
        }

        // BGMのループに依存しないよう、標準のタイマーに戻す
        if (timeRemaining > 0f)
        {
            timeRemaining -= Time.deltaTime;

            // 残り30秒を切ったらスポーン速度を2倍に
            if (timeRemaining <= 30f && spawner != null)
            {
                spawner.SetSpawnSpeedMultiplier(2f);
            }

            if (timeRemaining <= 0f)
            {
                timeRemaining = 0f;
                EndGame();
            }
        }
    }

    public void StartGame()
    {
        isPlaying = true;
        isInSettings = false;
        isInResult = false;
        isInEnding = false;
        timeRemaining = gameDurationSeconds;
        score = 0;

        PlaySfx(startSfx);

        if (bgmController != null)
        {
            bgmController.PlayGameBgm();
        }

        UpdateScreenState();

        if (spawner != null)
        {
            spawner.ResetSpawnSpeedMultiplier();
            spawner.BeginSpawning();
        }

        PlayGameVideoJS();

        Debug.Log("Game started");
    }

    public void OnAkyoClicked(bool isTarget)
    {
        if (!isPlaying)
        {
            return;
        }

        if (isTarget)
        {
            score += 1000;
            PlaySfx(targetHitSfx);
        }
        else
        {
            score -= 500;

            if (score < 0)
            {
                score = 0;
            }

            PlaySfx(decoyHitSfx);
        }

        Debug.Log($"Score: {score}");
    }

    private void EndGame()
    {
        isPlaying = false;
        isInResult = true;

        if (spawner != null)
        {
            spawner.StopSpawning();
        }

        Debug.Log($"Game ended. Final score: {score}");

        if (score > highScore)
        {
            highScore = score;
            PlayerPrefs.SetInt(HighScoreKey, highScore);
            PlayerPrefs.Save();
        }

        UpdateScreenState();

        if (resultIntroImage != null)
        {
            resultIntroImage.SetActive(true);
        }

        if (bgmController != null)
        {
            bgmController.Stop();
        }

        PlayEndingVideoJS();
        PlaySfx(resultIntroSfx);

        if (returnToTitleCoroutine != null)
        {
            StopCoroutine(returnToTitleCoroutine);
        }

        returnToTitleCoroutine = StartCoroutine(ReturnToTitleAfterDelay());
    }

    public void OpenSettings()
    {
        isPlaying = false;
        isInSettings = true;
        isInResult = false;
        isInEnding = false;

        PlaySfx(settingsOpenSfx);

        if (bgmController != null)
        {
            bgmController.PlaySettingsBgm();
        }

        if (spawner != null)
        {
            spawner.StopSpawning();
        }

        UpdateScreenState();
    }

    public void CloseSettings()
    {
        isPlaying = false;
        isInSettings = false;
        isInResult = false;
        isInEnding = false;

        PlaySfx(settingsCloseSfx);

        UpdateScreenState();

        if (bgmController != null)
        {
            bgmController.PlayTitleBgm();
        }

        PlayTitleVideoJS();
    }

    private void UpdateScreenState()
    {
        if (startScreen != null)
        {
            startScreen.SetActive(!isPlaying && !isInSettings && !isInResult && !isInEnding);
        }

        if (gameScreen != null)
        {
            gameScreen.SetActive(isPlaying || isInResult);
        }

        if (postProcessVolume != null)
        {
            postProcessVolume.SetActive(isPlaying);
        }

         if (endingScreen != null)
         {
             endingScreen.SetActive(isInEnding);
         }

        if (settingsScreen != null)
        {
            settingsScreen.SetActive(isInSettings);
        }
    }

    private IEnumerator ReturnToTitleAfterDelay()
    {
        const float resultIntroSeconds = 5f;

        // 1. 終了SEを鳴らす時間（ゲーム画面 + イントロ画像）
        yield return new WaitForSeconds(resultIntroSeconds);

        if (resultIntroImage != null)
        {
            resultIntroImage.SetActive(false);
        }

        // 2. EndingScreen へ遷移してエンディングを表示
        isInResult = false;
        isInEnding = true;
        UpdateScreenState();

        float endingDurationSeconds = 10f;

        if (bgmController != null)
        {
            bgmController.PlayResultBgm();

            float clipLength = bgmController.GetResultBgmLength();
            if (clipLength > 0f)
            {
                endingDurationSeconds = clipLength;
            }
        }

        // エンディングを表示しておく時間
        yield return new WaitForSeconds(endingDurationSeconds);

        isInEnding = false;
        UpdateScreenState();

        if (bgmController != null)
        {
            bgmController.PlayTitleBgm();
        }

        PlayTitleVideoJS();
        returnToTitleCoroutine = null;
    }

    public void SetSfxVolume(float normalizedVolume)
    {
        sfxVolume = Mathf.Clamp01(normalizedVolume);
    }

    public float GetSfxVolume()
    {
        return sfxVolume;
    }

    public float GetTimeRemaining()
    {
        return timeRemaining;
    }

    public int GetScore()
    {
        return score;
    }

    public int GetHighScore()
    {
        return highScore;
    }

    public void SkipEndingAndReturnToTitle()
    {
        if (returnToTitleCoroutine != null)
        {
            StopCoroutine(returnToTitleCoroutine);
            returnToTitleCoroutine = null;
        }

        isPlaying = false;
        isInSettings = false;
        isInResult = false;
        isInEnding = false;

        if (resultIntroImage != null)
        {
            resultIntroImage.SetActive(false);
        }

        UpdateScreenState();

        if (bgmController != null)
        {
            bgmController.Stop();
            bgmController.PlayTitleBgm();
        }

        PlayTitleVideoJS();
    }

    public void PlaySfx(AudioClip clip)
    {
        if (clip == null)
        {
            return;
        }

        Camera mainCamera = Camera.main;

        if (mainCamera == null)
        {
            return;
        }

        AudioSource.PlayClipAtPoint(clip, mainCamera.transform.position, sfxVolume);
    }
}
