import { action, makeAutoObservable, runInAction } from "mobx";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  updateDoc,
  getDocs,
  where,
} from "firebase/firestore";
import {
  classReservationTemplate,
  groupJoinTemplate,
} from "../util/emailTemplates";
import { filterSubjectsByIds } from "../constants";

const DEFAULT_USER = {
  yellowTokens: 0,
  blueTokens: 0,
  redTokens: 0,
  role: "student",
};

class Store {
  // App Data
  analytics = {};
  upcomingEvents = [];
  academyGroups = [];
  nextAcademyGroups = [];
  professors = [];
  user = null;
  userReady = false;
  professors = [];

  // Static Data

  // App States
  isMobileOpen = false;
  loading = true;

  constructor() {
    makeAutoObservable({
      setUser: action, // Mark methods as actions
      setLoading: action,
      initializeAuth: action.bound, // Ensure actions are bound to the class instance
    });

    makeAutoObservable(this);
    this.initializeAuth();

    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);

    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);

    this.logout = this.logout.bind(this);
    this.sendPasswordReset = this.sendPasswordReset.bind(this);

    this.fetchAcademyGroups = this.fetchAcademyGroups.bind(this);
    this.fetchProfessors = this.fetchProfessors.bind(this);
    this.fetchAcademyGroupsByProfessorId =
      this.fetchAcademyGroupsByProfessorId.bind(this);
    this.reserveUserInAcademyGroup = this.reserveUserInAcademyGroup.bind(this);
    this.createAcademyGroup = this.createAcademyGroup.bind(this);
    this.editAcademyGroup = this.editAcademyGroup.bind(this);
    this.deleteAcademyGroup = this.deleteAcademyGroup.bind(this);
    this.handlePaymentCallback = this.handlePaymentCallback.bind(this);
    this.submitReview = this.submitReview.bind(this);
    this.updateProfessorAverageRating =
      this.updateProfessorAverageRating.bind(this);
    this.fetchAcademyGroupsForCurrentProfessor =
      this.fetchAcademyGroupsForCurrentProfessor.bind(this);
    this.addScheduleEntry = this.addScheduleEntry.bind(this);
    this.deleteScheduleEntry = this.deleteScheduleEntry.bind(this);
    this.deleteTimeRange = this.deleteTimeRange.bind(this);
    this.fetchEventsForProfessor = this.fetchEventsForProfessor.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.updateEventAndSubjectScores =
      this.updateEventAndSubjectScores.bind(this);
    this.fetchUpcomingEventsForUser =
      this.fetchUpcomingEventsForUser.bind(this);
    this.fetchAcademyGroupsForUser = this.fetchAcademyGroupsForUser.bind(this);
    this.fetchUserGrades = this.fetchUserGrades.bind(this);
    this.fetchUserProfileWithGrades =
      this.fetchUserProfileWithGrades.bind(this);

    this.fetchUserProfileById = this.fetchUserProfileById.bind(this);
    this.fetchUserGradesById = this.fetchUserGradesById.bind(this);
    this.fetchAllProfessors = this.fetchAllProfessors.bind(this);

    this.checkUserReview = this.checkUserReview.bind(this);

    this.fetchAcademyGroupsByProfessor =
      this.fetchAcademyGroupsByProfessor.bind(this);
    this.joinGroup = this.joinGroup.bind(this);
  }

  setUser(user) {
    this.user = user;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  async initializeAuth() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      runInAction(() => {
        this.setLoading(true); // Start with loading
      });

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          let userData = { uid: user.uid, ...userDoc.data() };

          if (userData.role === "professor") {
            const professorQuery = query(
              collection(db, "professors"),
              where("userId", "==", user.uid),
            );
            const professorSnapshot = await getDocs(professorQuery);

            if (!professorSnapshot.empty) {
              const professorData = professorSnapshot.docs[0].data();
              userData = { ...userData, ...professorData };
            }
          }

          runInAction(() => {
            this.setUser(userData);
            this.setLoading(false); // Finished loading
            this.userReady = true; // User data is ready
          });
        } else {
          runInAction(() => {
            this.setUser(null);
            this.setLoading(false); // Finished loading
            this.userReady = true; // User data is ready
          });
        }
      } else {
        runInAction(() => {
          this.setUser(null);
          this.setLoading(false); // Finished loading
          this.userReady = true; // User data is ready
        });
      }
    });
  }

  // MAIN PAGES

  async fetchAcademyGroupsByProfessor(professorId) {
    try {
      const q = query(
        collection(db, "academyGroups"),
        where("professorId", "==", professorId),
      );

      const querySnapshot = await getDocs(q);
      const academyGroups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: academyGroups }; // Return data directly
    } catch (error) {
      console.error("Error fetching academy groups:", error);
      return { success: false, error: "Error fetching academy groups" };
    }
  }

  async joinGroup(groupId) {
    if (!this.user || this.user.role !== "student") {
      return { success: false, error: "Only students can join groups." };
    }

    if (this.user.blueTokens < 1) {
      return { success: false, error: "Not enough blue tokens." };
    }

    try {
      // Fetch the group document
      const groupDocRef = doc(db, "academyGroups", groupId);
      const groupDoc = await getDoc(groupDocRef);

      if (!groupDoc.exists()) {
        return { success: false, error: "Group not found." };
      }

      const groupData = groupDoc.data();

      // Check if the user is already in the group
      if (groupData.users && groupData.users.includes(this.user.uid)) {
        return { success: false, error: "User is already in the group." };
      }

      const newUserList = [...(groupData.users || []), this.user.uid];

      // Update the group with the new user list
      await updateDoc(groupDocRef, {
        users: newUserList,
        activeUsers: newUserList.length,
      });

      // Update user's tokens (this would involve another Firestore call)
      await updateDoc(doc(db, "users", this.user.uid), {
        blueTokens: this.user.blueTokens - 1,
      });

      // send email
      const professorDocRef = doc(db, "professors", groupData.professorId);
      const professorSnapshot = await getDoc(professorDocRef);

      if (!professorSnapshot.exists()) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }
      console.log(professorSnapshot.data());

      try {
        // Fetch user and professor details
        const student = this.user;
        const professor = professorSnapshot.data();
        const professorUserData = await this.fetchUserProfileById(
          professor.userId,
        );

        if (!student || !professor) {
          throw new Error("Invalid student or professor ID");
        }

        // Prepare email templates
        const { studentEmail, professorEmail } = groupJoinTemplate(
          `${student.name} ${student.lastname}`,
          groupData.name,
          `${professor.name} ${professor.lastname}`,
          groupData.schedule,
          professor.link, // groupData.link??
        );

        // Send email to student
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: student.email,
            subject: studentEmail.subject,
            text: studentEmail.text,
          }),
        });

        // Send email to professor
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: professorUserData.data.email,
            subject: professorEmail.subject,
            text: professorEmail.text,
          }),
        });

        return { success: true };
      } catch (error) {
        console.log("Error creating event or sending email:", error);
        return { error: "Failed to create event or send email" };
      }

      return { success: true };
    } catch (error) {
      console.log("Error joining group:", error);
      return { success: false, error: "Error joining group." };
    }
  }

  async fetchAllProfessors() {
    try {
      const professorsCollection = collection(db, "professors"); // Replace "professors" with your Firestore collection name
      const professorsSnapshot = await getDocs(professorsCollection);
      const fetchedProfessors = professorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      runInAction(() => {
        this.professors = fetchedProfessors; // Store fetched professors in MobX store
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching professors:", error);
      return { error: "Error fetching professors" };
    }
  }

  // New function to fetch user profile by ID
  async fetchUserProfileById(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { error: "Error fetching user profile" };
    }
  }

  // New function to fetch a specific user's grades by user ID
  async fetchUserGradesById(userId) {
    try {
      const gradesRef = collection(db, "users", userId, "subjects");
      const gradesSnapshot = await getDocs(gradesRef);

      const grades = {};
      gradesSnapshot.forEach((doc) => {
        grades[doc.id] = doc.data();
      });

      return { success: true, data: grades };
    } catch (error) {
      console.error("Error fetching user grades:", error);
      return { error: "Error fetching user grades" };
    }
  }

  async fetchUserProfileWithGrades(userId) {
    try {
      const profileResult = await this.fetchUserProfileById(userId);
      if (!profileResult.success) {
        return { success: false, error: profileResult.error };
      }

      const gradesResult = await this.fetchUserGradesById(userId);
      if (!gradesResult.success) {
        return { success: false, error: gradesResult.error };
      }

      return {
        success: true,
        data: {
          userProfile: profileResult.data,
          userGrades: gradesResult.data,
        },
      };
    } catch (error) {
      console.error("Error fetching user profile with grades:", error);
      return { error: "Error fetching user profile with grades" };
    }
  }

  async fetchUserGrades() {
    if (!this.user) {
      console.error("User not loaded yet");
      return { success: false, error: "User not loaded yet" };
    }

    if (this.user.role === "sadasd") {
      return {
        success: false,
        error: "User is a professor, no grades to fetch",
      };
    }

    try {
      const gradesRef = collection(db, `users/${this.user.uid}/subjects`);
      const gradesSnapshot = await getDocs(gradesRef);

      const grades = {};

      gradesSnapshot.forEach((doc) => {
        grades[doc.id] = doc.data();
      });

      runInAction(() => {
        this.analytics = grades;
      });

      return { success: true };
    } catch (error) {
      console.error("Error fetching user grades:", error);
      return { success: false, error: "Error fetching user grades" };
    }
  }
  async fetchUpcomingEventsForUser(forceFetch = false) {
    try {
      if (!this.user) throw new Error("User not logged in");

      // Check if the data already exists and don't refetch unless forced
      if (!forceFetch && this.upcomingEvents.length > 0) {
        return { success: true };
      }

      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      let eventsQuery;

      // Modify the query based on the user's role
      if (this.user.role === "professor") {
        // Fetch events where professorId matches the professor's ID
        eventsQuery = query(
          collection(db, "events"),
          where("professorId", "==", this.user.professorId), // Correct field for professor
        );
      } else {
        // Fetch events where userId matches the student's ID
        eventsQuery = query(
          collection(db, "events"),
          where("userId", "==", this.user.uid), // Correct field for student
        );
      }
      const eventsSnapshot = await getDocs(eventsQuery);

      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if the user is a professor
      let nameDetails = {};
      let link = "";

      if (this.user.role === "professor") {
        // Extract unique user IDs
        const uniqueUserIds = [...new Set(events.map((event) => event.userId))];

        // Fetch user details for each unique user ID
        for (const userId of uniqueUserIds) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            nameDetails[userId] = `${userDoc.data().name} ${
              userDoc.data().lastname
            }`;
          } else {
            nameDetails[userId] = "Unknown User";
          }
        }

        // Map user names back to events
        events.forEach((event) => {
          event.participantName = nameDetails[event.userId];
        });
      } else {
        // Extract unique professor IDs
        const uniqueProfessorIds = [
          ...new Set(events.map((event) => event.professorId)),
        ];

        // Fetch professor details for each unique professor ID
        for (const professorId of uniqueProfessorIds) {
          const professorDoc = await getDoc(doc(db, "professors", professorId));
          if (professorDoc.exists()) {
            nameDetails[professorId] = `${professorDoc.data().name} ${
              professorDoc.data().lastname
            }`;
            link = professorDoc.data().link;
          } else {
            nameDetails[professorId] = "Unknown Professor";
          }
        }

        // Map professor names back to events
        events.forEach((event) => {
          event.professorName = nameDetails[event.professorId];
          event.link = link;
        });
      }

      runInAction(() => {
        this.upcomingEvents = events;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching upcoming events:", error);
      return { error: "Error fetching upcoming events" };
    }
  }
  async fetchAcademyGroupsForUser() {
    try {
      if (!this.user) throw new Error("User not logged in");

      const groupsQuery = query(
        collection(db, "academyGroups"),
        where("users", "array-contains", this.user.uid),
      );
      const groupsSnapshot = await getDocs(groupsQuery);

      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (this.user.role === "professor") {
        // If the user is a professor, fetch user details for each user ID in the academy groups
        for (let group of groups) {
          const userNames = await Promise.all(
            group.users.map(async (userId) => {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return `${userData.name} ${userData.lastname}`;
              } else {
                return "Unknown User";
              }
            }),
          );

          // Add the list of user names to the group object
          group.userNames = userNames;
        }
      }

      // Fetch professor names (common logic for both roles)
      const uniqueProfessorIds = [
        ...new Set(groups.map((group) => group.professorId)),
      ];

      const professorDetails = {};
      for (const professorId of uniqueProfessorIds) {
        const professorDoc = await getDoc(doc(db, "professors", professorId));
        if (professorDoc.exists()) {
          professorDetails[professorId] = professorDoc.data().name;
        } else {
          professorDetails[professorId] = "Unknown";
        }
      }

      // Map professor names back to academy groups
      const groupsWithDetails = groups.map((group) => ({
        ...group,
        professorName: professorDetails[group.professorId],
      }));

      runInAction(() => {
        this.academyGroups = groupsWithDetails;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching academy groups:", error);
      return { error: "Error fetching academy groups" };
    }
  }

  // GLOBAL MOBX STATE
  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
    });
  }

  async fetchAcademyGroups() {
    if (!this.user) return;

    try {
      const q = query(
        collection(db, "academyGroups"),
        where("users", "array-contains", this.user.uid),
      );
      const querySnapshot = await getDocs(q);
      const academyGroups = [];

      querySnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.academyGroups = academyGroups;
      });
    } catch (error) {
      console.log("Error fetching academy groups:", error);
    }
  }

  async fetchProfessors() {
    try {
      const querySnapshot = await getDocs(collection(db, "professors"));
      const professors = [];

      querySnapshot.forEach((doc) => {
        professors.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.professors = professors;
      });
    } catch (error) {
      console.log("Error fetching professors:", error);
    }
  }

  async fetchAcademyGroupsByProfessorId(professorId) {
    try {
      const q = query(
        collection(db, "academyGroups"),
        where("professor", "==", professorId),
      );
      const querySnapshot = await getDocs(q);
      const academyGroups = [];

      querySnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.academyGroups = academyGroups;
      });
    } catch (error) {
      console.log("Error fetching academy groups by professor ID:", error);
    }
  }

  async reserveUserInAcademyGroup(academyGroupId) {
    if (!this.user) {
      console.log("No user logged in.");
      return;
    }

    if (this.user.blueTokens < 1) {
      console.log("Not enough tokens.");
      return { error: "Not enough tokens" };
    }

    // Reduce the user's blue tokens by 1
    const updatedTokens = {
      blueTokens: this.user.blueTokens - 1,
    };

    // Update the user in Firestore
    await updateDoc(doc(db, "users", this.user.uid), updatedTokens);

    // Update the user in MobX store
    runInAction(() => {
      this.user = { ...this.user, ...updatedTokens };
    });

    try {
      const academyGroupRef = doc(db, "academyGroups", academyGroupId);
      const academyGroupDoc = await getDoc(academyGroupRef);

      if (!academyGroupDoc.exists()) {
        console.log("Academy group not found.");
        return;
      }

      const academyGroupData = academyGroupDoc.data();

      // Check if the group has reached its maximum capacity
      if (academyGroupData.activeUsers >= academyGroupData.maxUsers) {
        console.log("Student limit reached.");
        return { error: "Student limit reached" };
      }

      // Update the users array and activeUsers count
      const updatedUsersArray = [...academyGroupData.users, this.user.uid];
      const updatedActiveUsers = academyGroupData.activeUsers + 1;

      await updateDoc(academyGroupRef, {
        users: updatedUsersArray,
        activeUsers: updatedActiveUsers,
      });

      // Optionally, update the local MobX state with the new academyGroup data
      runInAction(() => {
        const updatedAcademyGroup = {
          ...academyGroupData,
          users: updatedUsersArray,
          activeUsers: updatedActiveUsers,
        };
        const index = this.academyGroups.findIndex(
          (group) => group.id === academyGroupId,
        );
        if (index !== -1) {
          this.academyGroups[index] = updatedAcademyGroup;
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error reserving user in academy group:", error);
      return { error: "Error reserving user in academy group" };
    }
  }

  async handlePaymentCallback(paymentDetails) {
    const { paymentId, status, packagePurchased, tokensPurchased, couponUsed } =
      paymentDetails;

    if (!this.user) {
      console.log("No user logged in.");
      return { error: "No user logged in" };
    }

    const newOrder = {
      userId: this.user.uid,
      date: new Date(),
      paymentId,
      status,
      packagePurchased,
      tokensPurchased,
      couponUsed: couponUsed || null, // Only add coupon if it was used
    };

    try {
      // Create the order in Firestore
      const orderDocRef = await addDoc(collection(db, "orders"), newOrder);

      // Determine which token type to increase
      let updatedTokens = {};

      switch (packagePurchased) {
        case "blueTokenPackage":
          updatedTokens.blueTokens =
            (this.user.blueTokens || 0) + tokensPurchased;
          break;
        case "yellowTokenPackage":
          updatedTokens.yellowTokens =
            (this.user.yellowTokens || 0) + tokensPurchased;
          break;
        // Add cases for other token types if needed
        default:
          console.log("Unknown package purchased.");
          return { error: "Unknown package purchased" };
      }

      // Update the user's token count in Firestore
      await updateDoc(doc(db, "users", this.user.uid), updatedTokens);

      // Update the user's token count in MobX store
      runInAction(() => {
        this.user = { ...this.user, ...updatedTokens };
      });

      return { success: true, orderId: orderDocRef.id };
    } catch (error) {
      console.log("Error creating order or updating tokens:", error);
      return { error: "Error creating order or updating tokens" };
    }
  }
  async checkUserReview(professorId) {
    try {
      const reviewQuery = query(
        collection(db, "reviews"),
        where("professorId", "==", professorId),
        where("userId", "==", this.user.uid),
      );

      const reviewSnapshot = await getDocs(reviewQuery);

      if (!reviewSnapshot.empty) {
        const reviewDoc = reviewSnapshot.docs[0]; // Fetch the first matching review
        return {
          success: true,
          reviewed: true,
          review: { id: reviewDoc.id, ...reviewDoc.data() },
        }; // Corrected structure to match the usage
      } else {
        return { success: true, reviewed: false, review: null };
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      return { success: false, error: "Error fetching review" };
    }
  }
  async submitReview(
    professorId,
    stars,
    existingReviewStars = null,
    reviewId = null,
  ) {
    // Check if user is logged in
    if (!this.user) {
      console.log("No user logged in.");
      return { error: "No user logged in" };
    }

    // Validate star rating
    if (stars < 1 || stars > 5) {
      console.log("Stars must be between 1 and 5.");
      return { error: "Invalid star rating" };
    }

    // Check if reviewId is provided
    if (reviewId) {
      // Handle updating an existing review
      try {
        const reviewDocRef = doc(db, "reviews", reviewId);
        const latestReviewDoc = await getDoc(reviewDocRef);

        if (!latestReviewDoc.exists()) {
          console.log("Review not found.");
          return { error: "Review not found." };
        }

        const latestReviewData = latestReviewDoc.data();
        const currentStars = latestReviewData.stars;

        if (currentStars === stars) {
          console.log(
            "New rating is the same as the current rating. No update needed.",
          );
          return {
            error:
              "New rating is the same as the current rating. No update needed.",
          };
        }

        // Update the existing review
        await updateDoc(reviewDocRef, {
          stars,
          date: new Date(),
        });

        // Update the professor's average rating with the new rating
        await this.updateProfessorAverageRating(
          professorId,
          stars,
          existingReviewStars,
        );

        return { success: true, updated: true };
      } catch (error) {
        console.log("Error updating review:", error);
        return { error: "Error updating review" };
      }
    } else {
      // Handle creating a new review
      try {
        const newReview = {
          userId: this.user.uid,
          professorId,
          stars,
          date: new Date(),
        };

        await addDoc(collection(db, "reviews"), newReview);

        // Update the professor's average rating with the new rating
        await this.updateProfessorAverageRating(professorId, stars);

        return { success: true, updated: false };
      } catch (error) {
        console.log("Error creating review:", error);
        return { error: "Error creating review" };
      }
    }
  }
  async updateProfessorAverageRating(professorId, newRating, oldRating = null) {
    console.log({ newRating, oldRating });
    try {
      const professorDocRef = doc(db, "professors", professorId);
      const professorDoc = await getDoc(professorDocRef);

      if (!professorDoc.exists()) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorData = professorDoc.data();
      const { averageRating = 0, reviewCount = 0 } = professorData;

      let newAverageRating, newReviewCount;
      if (oldRating !== null) {
        // Adjust the average rating calculation if updating an existing review
        newAverageRating =
          (averageRating * reviewCount - oldRating + newRating) / reviewCount;
      } else {
        // Calculate the new average rating for a new review
        newReviewCount = reviewCount + 1;
        newAverageRating =
          (averageRating * reviewCount + newRating) / newReviewCount;
      }

      // Update the professor's document with the new average rating and review count
      await updateDoc(professorDocRef, {
        averageRating: newAverageRating,
        reviewCount: oldRating !== null ? reviewCount : newReviewCount,
      });

      return { success: true };
    } catch (error) {
      console.log("Error updating professor's average rating:", error);
      return { error: "Error updating professor's average rating" };
    }
  }

  async createAcademyGroup(name, subject, studentType, schedule) {
    if (!this.user || this.user.role !== "professor") {
      console.log(
        "Access denied: Only professors can create an academy group.",
      );
      return { error: "Access denied" };
    }

    try {
      // Find the professor's ID based on the logged-in user's ID
      const professorQuery = query(
        collection(db, "professors"),
        where("userId", "==", this.user.uid),
      );
      const professorSnapshot = await getDocs(professorQuery);

      if (professorSnapshot.empty) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorDoc = professorSnapshot.docs[0];
      const professorId = professorDoc.id;

      // Create the new academy group
      const newAcademyGroup = {
        name,
        subject,
        studentType,
        professorId,
        schedule,
        users: [], // Initially empty
        activeUsers: 0,
        maxUsers: 10, // Default max users, can be customized
        createdAt: new Date(),
      };

      await addDoc(collection(db, "academyGroups"), newAcademyGroup);

      return { success: true };
    } catch (error) {
      console.log("Error creating academy group:", error);
      return { error: "Error creating academy group" };
    }
  }

  async editAcademyGroup(academyGroupId, updatedData) {
    if (!this.user || this.user.role !== "professor") {
      console.log("Access denied: Only professors can edit an academy group.");
      return { error: "Access denied" };
    }

    try {
      const academyGroupRef = doc(db, "academyGroups", academyGroupId);

      // Update the academy group with the new data
      await updateDoc(academyGroupRef, updatedData);

      // Optionally, update the local MobX state if needed
      runInAction(() => {
        const index = this.academyGroups.findIndex(
          (group) => group.id === academyGroupId,
        );
        if (index !== -1) {
          this.academyGroups[index] = {
            ...this.academyGroups[index],
            ...updatedData,
          };
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error editing academy group:", error);
      return { error: "Error editing academy group" };
    }
  }

  async deleteAcademyGroup(academyGroupId) {
    if (!this.user || this.user.role !== "professor") {
      console.log(
        "Access denied: Only professors can delete an academy group.",
      );
      return { error: "Access denied" };
    }

    try {
      const academyGroupRef = doc(db, "academyGroups", academyGroupId);

      // Delete the academy group document
      await deleteDoc(academyGroupRef);

      // Optionally, remove the academy group from the local MobX state
      runInAction(() => {
        this.academyGroups = this.academyGroups.filter(
          (group) => group.id !== academyGroupId,
        );
      });

      return { success: true };
    } catch (error) {
      console.log("Error deleting academy group:", error);
      return { error: "Error deleting academy group" };
    }
  }

  // async fetchAcademyGroupsForCurrentProfessor() {
  //   if (!this.user || this.user.role !== "professor") {
  //     console.log(
  //       "Access denied: Only professors can view their academy groups.",
  //     );
  //     return { error: "Access denied" };
  //   }

  //   try {
  //     const professorQuery = query(
  //       collection(db, "professors"),
  //       where("userId", "==", this.user.uid),
  //     );
  //     const professorSnapshot = await getDocs(professorQuery);

  //     if (professorSnapshot.empty) {
  //       console.log("Professor not found.");
  //       return { error: "Professor not found" };
  //     }

  //     const professorDoc = professorSnapshot.docs[0];
  //     const professorId = professorDoc.id;

  //     const academyGroupsQuery = query(
  //       collection(db, "academyGroups"),
  //       where("professorId", "==", professorId),
  //     );

  //     const academyGroupsSnapshot = await getDocs(academyGroupsQuery);
  //     const academyGroups = [];

  //     academyGroupsSnapshot.forEach((doc) => {
  //       academyGroups.push({ id: doc.id, ...doc.data() });
  //     });

  //     runInAction(() => {
  //       this.academyGroups = academyGroups;
  //     });

  //     return { success: true };
  //   } catch (error) {
  //     console.log("Error fetching academy groups:", error);
  //     return { error: "Error fetching academy groups" };
  //   }
  // }

  async fetchAcademyGroupsForCurrentProfessor() {
    if (!this.user || this.user.role !== "professor") {
      console.log(
        "Access denied: Only professors can view their academy groups.",
      );
      return { error: "Access denied" };
    }

    try {
      // Step 1: Fetch the professor's details using their user ID
      const professorQuery = query(
        collection(db, "professors"),
        where("userId", "==", this.user.uid),
      );
      const professorSnapshot = await getDocs(professorQuery);

      if (professorSnapshot.empty) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorDoc = professorSnapshot.docs[0];
      const professorId = professorDoc.id;

      // Step 2: Fetch all academy groups for the professor
      const academyGroupsQuery = query(
        collection(db, "academyGroups"),
        where("professorId", "==", professorId),
      );

      const academyGroupsSnapshot = await getDocs(academyGroupsQuery);
      const academyGroups = [];

      academyGroupsSnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      // Step 3: Extract unique user IDs from all academy groups
      const uniqueUserIds = new Set();
      academyGroups.forEach((group) => {
        if (group.users) {
          group.users.forEach((userId) => uniqueUserIds.add(userId));
        }
      });

      // Step 4: Fetch user details for each unique user ID
      const nameDetails = {};
      for (const userId of uniqueUserIds) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          nameDetails[userId] = `${userDoc.data().name} ${
            userDoc.data().lastname
          }`;
        } else {
          nameDetails[userId] = "Unknown User";
        }
      }

      // Step 5: Map user names back to each academy group
      academyGroups.forEach((group) => {
        if (group.users) {
          group.participantNames = group.users.map(
            (userId) => nameDetails[userId] || "Unknown User",
          );
        }
      });

      // Step 6: Update the state with the fetched academy groups
      runInAction(() => {
        this.academyGroups = academyGroups;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching academy groups:", error);
      return { error: "Error fetching academy groups" };
    }
  }

  // EVENTS

  async createEvent({
    date,
    timeRange,
    userId,
    professorId,
    subject,
    classType,
    notes,
  }) {
    console.log({
      date,
      timeRange,
      userId,
      professorId,
      subject,
      classType,
      notes,
    });
    if (!this.user || this.user.role !== "student") {
      console.log("Access denied: Only students can create events.");
      return { error: "Access denied" };
    }
    if (this.user.yellowTokens <= 0) {
      console.log("Not enough yellow tokens.");
      return { error: "Not enough yellow tokens" };
    }
    try {
      const professorDocRef = doc(db, "professors", professorId);
      const professorSnapshot = await getDoc(professorDocRef);

      if (!professorSnapshot.exists()) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }
      console.log(professorSnapshot.data());

      const currentSchedule = professorSnapshot.data().schedule || [];

      // Find the date entry in the professor's schedule
      const existingEntryIndex = currentSchedule.findIndex(
        (entry) => entry.date === date,
      );
      if (existingEntryIndex > -1) {
        const timeRangeIndex = currentSchedule[
          existingEntryIndex
        ].timeRanges.findIndex(
          (range) => range.from === timeRange.from && range.to === timeRange.to,
        );

        if (
          timeRangeIndex > -1 &&
          currentSchedule[existingEntryIndex].timeRanges[timeRangeIndex]
            .isScheduled
        ) {
          return { error: "This time range is already scheduled." };
        }

        // Mark the time range as scheduled
        currentSchedule[existingEntryIndex].timeRanges[
          timeRangeIndex
        ].isScheduled = true;
      } else {
        return {
          error:
            "This time range is not available in the professor's schedule.",
        };
      }

      // Update the professor's schedule in Firestore
      await updateDoc(professorDocRef, { schedule: currentSchedule });

      // Subtract 1 red token from the user's balance
      const updatedUserTokens = this.user.yellowTokens - 1;
      await updateDoc(doc(db, "users", this.user.uid), {
        yellowTokens: updatedUserTokens,
      });

      runInAction(() => {
        this.user.yellowTokens = updatedUserTokens;
      });

      const event = {
        date,
        timeRange,
        userId,
        professorId,
        subject,
        classType,
        notes,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "events"), event);

      runInAction(() => {
        console.log("Event created successfully:", event);
      });

      try {
        // Fetch user and professor details
        const student = this.user;
        const professor = professorSnapshot.data();
        const professorUserData = await this.fetchUserProfileById(
          professor.userId,
        );

        if (!student || !professor) {
          throw new Error("Invalid student or professor ID");
        }

        const subjectLabel = filterSubjectsByIds([subject])[0]?.label;

        // Prepare email templates
        const { studentEmail, professorEmail } = classReservationTemplate(
          `${student.name} ${student.lastname}`,
          `${professor.name} ${professor.lastname}`,
          date,
          `${timeRange.from} - ${timeRange.to}`,
          subjectLabel,
          classType,
          notes,
          professor.link,
        );

        // Send email to student
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: student.email,
            subject: studentEmail.subject,
            text: studentEmail.text,
          }),
        });

        // Send email to professor
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: professorUserData.data.email,
            subject: professorEmail.subject,
            text: professorEmail.text,
          }),
        });

        return { success: true };
      } catch (error) {
        console.error("Error creating event or sending email:", error);
        return { error: "Failed to create event or send email" };
      }
    } catch (error) {
      console.log("Error creating event:", error);
      return { error: "Error creating event" };
    }
  }

  // PROFESOR TERMINI PRAVI

  async addScheduleEntry(date, timeRanges) {
    if (!this.user || this.user.role !== "professor") {
      console.log("Access denied: Only professors can manage schedules.");
      return { error: "Access denied" };
    }

    try {
      const professorQuery = query(
        collection(db, "professors"),
        where("userId", "==", this.user.uid),
      );
      const professorSnapshot = await getDocs(professorQuery);

      if (professorSnapshot.empty) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorDoc = professorSnapshot.docs[0];
      const currentSchedule = professorDoc.data().schedule || [];

      // Convert the date to a string in the format "YYYY-MM-DD"
      const dateString = date.toISOString().split("T")[0];

      // Check if the date already exists in the schedule
      const existingEntryIndex = currentSchedule.findIndex(
        (entry) => entry.date === dateString,
      );

      if (existingEntryIndex > -1) {
        // If the date exists, merge the new time ranges with the existing time ranges
        currentSchedule[existingEntryIndex].timeRanges.push(...timeRanges);
      } else {
        // If the date doesn't exist, add a new entry
        const newEntry = { date: dateString, timeRanges };
        currentSchedule.push(newEntry);
      }

      // Use professorDoc.ref to get the document reference
      await updateDoc(professorDoc.ref, { schedule: currentSchedule });

      runInAction(() => {
        this.user.schedule = currentSchedule;
      });

      return { success: true };
    } catch (error) {
      console.log("Error adding schedule entry:", error);
      return { error: "Error adding schedule entry" };
    }
  }

  async deleteScheduleEntry(date) {
    if (!this.user || this.user.role !== "professor") {
      console.log("Access denied: Only professors can manage schedules.");
      return { error: "Access denied" };
    }

    try {
      const professorDocRef = doc(db, "professors", this.user.professorId);
      const professorDoc = await getDoc(professorDocRef);

      if (!professorDoc.exists()) {
        console.log("Professor document not found.");
        return { error: "Professor document not found" };
      }

      const currentSchedule = professorDoc.data().schedule || [];
      const updatedSchedule = currentSchedule.filter(
        (entry) => entry.date !== date,
      );

      await updateDoc(professorDocRef, { schedule: updatedSchedule });

      runInAction(() => {
        this.user.schedule = updatedSchedule;
      });

      return { success: true };
    } catch (error) {
      console.log("Error deleting schedule entry:", error);
      return { error: "Error deleting schedule entry" };
    }
  }

  async deleteTimeRange(date, timeRangeToDelete) {
    if (!this.user || this.user.role !== "professor") {
      console.log("Access denied: Only professors can manage schedules.");
      return { error: "Access denied" };
    }

    try {
      const professorQuery = query(
        collection(db, "professors"),
        where("userId", "==", this.user.uid),
      );
      const professorSnapshot = await getDocs(professorQuery);

      if (professorSnapshot.empty) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorDoc = professorSnapshot.docs[0];
      let currentSchedule = professorDoc.data().schedule || [];

      // Find the date entry
      const existingEntryIndex = currentSchedule.findIndex(
        (entry) => entry.date === date,
      );

      if (existingEntryIndex > -1) {
        // Filter out the time range to delete
        const updatedTimeRanges = currentSchedule[
          existingEntryIndex
        ].timeRanges.filter(
          (range) =>
            range.from !== timeRangeToDelete.from ||
            range.to !== timeRangeToDelete.to,
        );

        // If no time ranges are left, remove the entire date entry
        if (updatedTimeRanges.length === 0) {
          currentSchedule = currentSchedule.filter(
            (_, index) => index !== existingEntryIndex,
          );
        } else {
          currentSchedule[existingEntryIndex].timeRanges = updatedTimeRanges;
        }

        await updateDoc(professorDoc.ref, { schedule: currentSchedule });

        runInAction(() => {
          this.user.schedule = currentSchedule;
        });

        return { success: true };
      } else {
        console.log("Date not found in schedule.");
        return { error: "Date not found in schedule." };
      }
    } catch (error) {
      console.log("Error deleting time range:", error);
      return { error: "Error deleting time range" };
    }
  }

  // EVENTS
  async fetchEventsForProfessor(professorId) {
    try {
      const eventsQuery = query(
        collection(db, "events"),
        where("professorId", "==", professorId),
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsList = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      runInAction(() => {
        this.events = eventsList;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching events:", error);
      return { error: "Error fetching events" };
    }
  }

  async updateEventAndSubjectScores(event) {
    try {
      const eventRef = doc(db, "events", event.id);
      const eventDoc = await getDoc(eventRef);
      const previousEvent = eventDoc.data();

      const isEventGraded = previousEvent.isEventGraded;

      // Update the event document in Firestore
      await updateDoc(eventRef, {
        scores: event.scores,
        comment: event.comment,
        isEventGraded: true,
      });

      // Update the user's subject scores in the subcollection
      const subjectRef = doc(
        db,
        `users/${event.userId}/subjects/${event.subject}`,
      );
      const subjectDoc = await getDoc(subjectRef);

      if (subjectDoc.exists()) {
        const subjectData = subjectDoc.data();
        const totalEvents = subjectData.totalEvents;

        let updatedScores = { ...subjectData.totalScores };

        if (isEventGraded) {
          // Calculate the difference between the old and new scores
          const scoreDifferences = {
            attention: event.scores.attention - previousEvent.scores.attention,
            memory: event.scores.memory - previousEvent.scores.memory,
            skill: event.scores.skill - previousEvent.scores.skill,
            interest: event.scores.interest - previousEvent.scores.interest,
          };

          // Update the scores by adding the differences
          updatedScores.attention += scoreDifferences.attention;
          updatedScores.memory += scoreDifferences.memory;
          updatedScores.skill += scoreDifferences.skill;
          updatedScores.interest += scoreDifferences.interest;
        } else {
          // Add the new scores if the event was not previously graded
          updatedScores.attention += event.scores.attention;
          updatedScores.memory += event.scores.memory;
          updatedScores.skill += event.scores.skill;
          updatedScores.interest += event.scores.interest;
        }

        // Update the subject document
        await updateDoc(subjectRef, {
          totalScores: updatedScores,
          totalEvents: isEventGraded ? totalEvents : totalEvents + 1,
        });
      } else {
        // Create new subject document if it doesn't exist
        const initialScores = {
          totalScores: event.scores,
          totalEvents: 1,
        };
        await setDoc(subjectRef, initialScores);
      }

      // Update the MobX state
      runInAction(() => {
        const eventIndex = this.events.findIndex((e) => e.id === event.id);
        if (eventIndex !== -1) {
          this.events[eventIndex] = event;
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error updating event and subject scores:", error);
      return { error: "Error updating event and subject scores" };
    }
  }

  // NEW FUNCTIONS ABOVE

  async loginWithEmail({ email, password }) {
    try {
      this.loading = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      runInAction(() => {
        this.user = userCredential.user;
        this.loading = false;
      });
    } catch (error) {
      console.log("Error logging in:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async signupWithEmail(email, password, name, lastname, academicLevel) {
    try {
      this.loading = true;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Additional user properties
      const newUserProfile = {
        ...DEFAULT_USER,
        createdAt: new Date(),
        name: name,
        lastname: lastname,
        academicLevel: academicLevel,
        email: email,
        uid: userCredential.user.uid,
      };

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);

      runInAction(() => {
        this.user = newUserProfile;
        this.loading = false;
      });
    } catch (error) {
      console.log("Error signing up:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth); // Sign out from Firebase Authentication
      runInAction(() => {
        this.user = null; // Reset the user in the store
      });
    } catch (error) {
      console.log("Error during logout:", error);
      // Handle any errors that occur during logout
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      // Handle success, such as showing a message to the user
    } catch (error) {
      console.log("Error sending password reset email:", error);
      // Handle errors, such as invalid email, etc.
    }
  }
}

const MobxStore = new Store();
export default MobxStore;
