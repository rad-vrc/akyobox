using System.Collections;
using UnityEngine;

public class AkyoSpawner : MonoBehaviour
{
    public static AkyoSpawner Instance { get; private set; }

    [SerializeField]
    private GameObject targetAkyoPrefab;

    [SerializeField]
    private GameObject[] decoyAkyoPrefabs;

    [SerializeField]
    private AudioClip spawnSfx;

    [SerializeField]
    private int minAkyoPerWave = 1;

    [SerializeField]
    private int maxAkyoPerWave = 3;

    [SerializeField]
    private float minSpawnInterval = 1f;

    [SerializeField]
    private float maxSpawnInterval = 2f;

    [SerializeField]
    private float akyoLifetime = 1.5f;

    [SerializeField]
    private RectTransform[] spawnSlots;

    private bool spawning;
    private bool[] slotOccupied;
    private float spawnSpeedMultiplier = 1f;

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
        if (minAkyoPerWave < 1)
        {
            minAkyoPerWave = 1;
        }

        if (maxAkyoPerWave < minAkyoPerWave)
        {
            maxAkyoPerWave = minAkyoPerWave;
        }

        if (spawnSlots == null)
        {
            slotOccupied = new bool[0];
        }
        else
        {
            slotOccupied = new bool[spawnSlots.Length];
        }
    }

    public void BeginSpawning()
    {
        if (spawning)
        {
            return;
        }

        spawning = true;
        Debug.Log($"AkyoSpawner.BeginSpawning: min={minAkyoPerWave}, max={maxAkyoPerWave}, slots={spawnSlots?.Length ?? 0}");
        StartCoroutine(SpawnLoop());
    }

    public void StopSpawning()
    {
        spawning = false;
        StopAllCoroutines();
    }

    public void SetSpawnSpeedMultiplier(float multiplier)
    {
        spawnSpeedMultiplier = Mathf.Max(0.01f, multiplier);
    }

    public void ResetSpawnSpeedMultiplier()
    {
        spawnSpeedMultiplier = 1f;
    }

    private IEnumerator SpawnLoop()
    {
        while (spawning)
        {
            int count = Random.Range(minAkyoPerWave, maxAkyoPerWave + 1);

            for (int i = 0; i < count; i++)
            {
                SpawnOneAkyo();
            }

            float wait = Random.Range(minSpawnInterval, maxSpawnInterval) / spawnSpeedMultiplier;
            yield return new WaitForSeconds(wait);
        }
    }

    private void SpawnOneAkyo()
    {
        RectTransform slot = GetAvailableSlot();

        if (slot == null)
        {
            Debug.LogWarning("AkyoSpawner.SpawnOneAkyo: no available slot.");
            return;
        }

        bool spawnTarget = Random.value < 0.5f;
        GameObject prefabToSpawn = null;

        if (spawnTarget && targetAkyoPrefab != null)
        {
            prefabToSpawn = targetAkyoPrefab;
        }
        else if (!spawnTarget && decoyAkyoPrefabs != null && decoyAkyoPrefabs.Length > 0)
        {
            int index = Random.Range(0, decoyAkyoPrefabs.Length);
            prefabToSpawn = decoyAkyoPrefabs[index];
        }

        if (prefabToSpawn == null)
        {
            Debug.LogWarning("AkyoSpawner.SpawnOneAkyo: prefabToSpawn is null.");
            return;
        }

        // 効果音再生
        if (GameManager.Instance != null)
        {
            GameManager.Instance.PlaySfx(spawnSfx);
        }

        GameObject instance = Instantiate(prefabToSpawn, slot);

        // UIスロットの中央に配置
        RectTransform instanceRect = instance.transform as RectTransform;
        if (instanceRect != null)
        {
            instanceRect.anchoredPosition = Vector2.zero;
        }

        AkyoTarget target = instance.GetComponent<AkyoTarget>();

        if (target != null)
        {
            target.SetIsTarget(spawnTarget);
            target.SetLifetime(akyoLifetime);
            int slotIndex = GetSlotIndex(slot);
            target.SetSlotInfo(slotIndex, this);
            target.InitializeHiddenPosition();
            MarkSlot(slotIndex, true);
        }
        else
        {
            Destroy(instance, akyoLifetime);
        }
    }

    private Vector2 GetRandomWorldPosition()
    {
        Camera cam = Camera.main;

        if (cam == null)
        {
            return Vector2.zero;
        }

        float x = Random.Range(0.1f, 0.9f);
        float y = Random.Range(0.2f, 0.8f);
        Vector3 viewportPos = new Vector3(x, y, Mathf.Abs(cam.transform.position.z));
        Vector3 worldPos = cam.ViewportToWorldPoint(viewportPos);
        return new Vector2(worldPos.x, worldPos.y);
    }

    private RectTransform GetAvailableSlot()
    {
        if (spawnSlots == null || spawnSlots.Length == 0)
        {
            return null;
        }

        if (slotOccupied == null || slotOccupied.Length != spawnSlots.Length)
        {
            slotOccupied = new bool[spawnSlots.Length];
        }

        var available = new System.Collections.Generic.List<int>();

        for (int i = 0; i < spawnSlots.Length; i++)
        {
            if (!slotOccupied[i] && spawnSlots[i] != null)
            {
                available.Add(i);
            }
        }

        if (available.Count == 0)
        {
            return null;
        }

        int selectedIndex = available[Random.Range(0, available.Count)];
        return spawnSlots[selectedIndex];
    }

    private int GetSlotIndex(Transform slot)
    {
        for (int i = 0; i < spawnSlots.Length; i++)
        {
            if (spawnSlots[i] == slot)
            {
                return i;
            }
        }

        return -1;
    }

    private void MarkSlot(int index, bool occupied)
    {
        if (index < 0 || slotOccupied == null || index >= slotOccupied.Length)
        {
            return;
        }

        slotOccupied[index] = occupied;
    }

    public void ReleaseSlot(int index)
    {
        MarkSlot(index, false);
    }
}
