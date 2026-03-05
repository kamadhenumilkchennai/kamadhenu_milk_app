import {
  usePauseSubscriptionDays,
  useSubscriptionPauses,
} from "@/api/subscription";
import logger from "@/lib/logger";
import { notifyAdminsAboutSkip } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

type Props = {
  visible: boolean;
  onClose: () => void;
  subscriptionId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
};

export default function SkipDeliveryModal({
  visible,
  onClose,
  subscriptionId,
  startDate,
  endDate,
}: Props) {
  type MarkedDate = {
    selected?: boolean;
    selectedColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    marked?: boolean;
    dotColor?: string;
  };

  const [selectedDates, setSelectedDates] = useState<
    Record<string, MarkedDate>
  >({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: pausedDays } = useSubscriptionPauses(subscriptionId);
  const { mutate, isPending } = usePauseSubscriptionDays();

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- DISABLED DATES ---------------- */
  const disabledDates = useMemo(() => {
    const map: Record<string, MarkedDate> = {};

    /* ---------- Disable today ---------- */
    map[today] = {
      disabled: true,
      disableTouchEvent: true,
    };

    /* ---------- Disable past dates ---------- */
    if (startDate) {
      let cursor = new Date(startDate);
      const todayDate = new Date(today);

      while (cursor < todayDate) {
        const d = cursor.toISOString().split("T")[0];
        map[d] = {
          disabled: true,
          disableTouchEvent: true,
        };
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    /* ---------- Disable already paused dates ---------- */
    pausedDays?.forEach((p) => {
      map[p.pause_date] = {
        disabled: true,
        disableTouchEvent: true,
        marked: true,
        dotColor: "red",
      };
    });

    return map;
  }, [pausedDays, startDate, today]);

  const markedDatesMap = useMemo(() => {
    const map: Record<string, MarkedDate> = {};

    /* ---------- TODAY ---------- */
    map[today] = {
      disabled: true,
      disableTouchEvent: true,
    };

    /* ---------- PAST DATES ---------- */
    if (startDate) {
      let cursor = new Date(startDate);
      const todayDate = new Date(today);

      while (cursor < todayDate) {
        const d = cursor.toISOString().split("T")[0];
        map[d] = {
          disabled: true,
          disableTouchEvent: true,
        };
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    /* ---------- PAUSED DATES ---------- */
    pausedDays?.forEach((p) => {
      map[p.pause_date] = {
        disabled: true,
        disableTouchEvent: true,
        marked: true,
        dotColor: "red",
      };
    });

    /* ---------- START DATE DOT ---------- */
    if (startDate) {
      map[startDate] = {
        ...(map[startDate] ?? {}),
        marked: true,
        dotColor: "green",
      };
    }

    /* ---------- END DATE DOT ---------- */
    if (endDate) {
      map[endDate] = {
        ...(map[endDate] ?? {}),
        marked: true,
        dotColor: "blue",
      };
    }

    return map;
  }, [pausedDays, startDate, endDate, today]);

  /* ---------------- TOGGLE DATE ---------------- */
  const onDayPress = (day: { dateString: string }) => {
    const date = day.dateString;

    if (markedDatesMap[date]?.disabled) return;

    setSelectedDates((prev) => {
      const copy = { ...prev };
      if (copy[date]) {
        delete copy[date];
      } else {
        copy[date] = {
          selected: true,
          selectedColor: "#ef4444",
        };
      }
      return copy;
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleConfirm = () => {
    const dates = Object.keys(selectedDates);
    if (!dates.length) return;

    // Pause the subscription days
    mutate(
      { subscriptionId, dates, reason },
      {
        onSuccess: async () => {
          // Clear local state
          setSelectedDates({});
          setReason("");
          setConfirmOpen(false);
          onClose();

          // ✅ Notify admin & delivery
          try {
            await notifyAdminsAboutSkip({ subscriptionId, dates, reason });
          } catch (e) {
            logger.error("Failed to notify admins/delivery", e);
          }
        },
      },
    );
  };

  /* ---------------- CLOSE HANDLER ---------------- */
  const handleClose = () => {
    setSelectedDates({});
    setReason("");
    setConfirmOpen(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        {/* Main modal */}
        <View className="bg-white rounded-t-2xl p-4 gap-4 max-h-[80%]">
          {/* 🔹 HEADER */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Skip Delivery Days</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Calendar
            minDate={startDate}
            maxDate={endDate ?? undefined}
            markedDates={{
              ...markedDatesMap,
              ...selectedDates,
            }}
            onDayPress={onDayPress}
          />

          {/* Optional Reason */}
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason (optional)"
            className="border border-gray-300 p-3 rounded-lg mt-2"
          />

          {/* Submit button */}
          <TouchableOpacity
            disabled={!Object.keys(selectedDates).length || isPending}
            onPress={() => setConfirmOpen(true)}
            className={`py-4 rounded-xl items-center ${
              !Object.keys(selectedDates).length || isPending
                ? "bg-gray-400"
                : "bg-red-500"
            }`}
          >
            <Text className="text-white font-bold">Skip Selected Days</Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedDates({});
              setReason("");
              onClose();
            }}
          >
            <Text className="text-center text-gray-500 font-semibold pb-3">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- CONFIRM ALERT MODAL ---------------- */}
        <Modal visible={confirmOpen} transparent animationType="fade">
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className="bg-white rounded-xl p-6 w-11/12 max-h-[70%]">
              <Text className="text-lg font-bold mb-4 text-center">
                Confirm Skip
              </Text>
              <ScrollView className="mb-4">
                {Object.keys(selectedDates).map((d) => (
                  <Text key={d} className="text-center text-gray-700 py-1">
                    {d}
                  </Text>
                ))}
                {reason ? (
                  <Text className="text-center text-gray-500 mt-2">
                    Reason: {reason}
                  </Text>
                ) : null}
              </ScrollView>
              <View className="flex-row justify-around gap-4">
                <TouchableOpacity
                  onPress={() => setConfirmOpen(false)}
                  className="flex-1 py-3 bg-gray-200 rounded-lg items-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex-1 py-3 bg-red-500 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Yes, Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}
